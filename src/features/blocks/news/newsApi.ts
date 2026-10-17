import type {NewsBlockConfig} from '@/core/config/schema'
import {type NewsItem, parseFeed} from './feedParser'

const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { time: number; items: NewsItem[] }>()

async function fetchFeed(url: string, title?: string): Promise<NewsItem[]> {
  const key = `${url}|${title ?? ''}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) return cached.items

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const items = parseFeed(await response.text(), url, title)
  cache.set(key, { time: Date.now(), items })
  return items
}

export interface NewsResult {
  items: NewsItem[]
  failedFeeds: number
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Terms are matched as whole strings (a multi-word term must appear as-is in the title),
 * ignoring case and accents. An empty `include` list keeps everything.
 */
export function passesFilters(item: NewsItem, include: string[], exclude: string[]): boolean {
  const title = normalize(item.title)
  const found = (terms: string[]) =>
    terms.map(normalize).some((term) => term !== '' && title.includes(term))
  const hasInclude = include.some((term) => normalize(term) !== '')
  return (!hasInclude || found(include)) && !found(exclude)
}

/** Merges all feeds, newest first. A failing feed does not prevent the others from showing. */
export async function fetchNews(config: NewsBlockConfig): Promise<NewsResult> {
  const results = await Promise.allSettled(config.feeds.map((f) => fetchFeed(f.url, f.title)))
  const items = results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((item) => passesFilters(item, config.includeTerms, config.excludeTerms))
    .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
    .slice(0, config.maxItems)
  return { items, failedFeeds: results.filter((r) => r.status === 'rejected').length }
}
