import type {NewsBlockConfig} from '@/core/config/schema'
import {readStoredJson, writeStoredJson} from '@/core/storage/jsonCache'
import {newsKey} from '@/core/storage/cacheKeys'
import {type NewsItem, parseFeed} from './feedParser'

const MAX_CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { time: number; items: NewsItem[] }>()

const storageKey = newsKey

async function fetchFeed(url: string, ttlMs: number, title?: string): Promise<NewsItem[]> {
  const key = `${url}|${title ?? ''}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.time < ttlMs) return cached.items

  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const items = parseFeed(await response.text(), url, title)
  cache.set(key, { time: Date.now(), items })
  await writeStoredJson(storageKey(url, title), items)
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

function mergeItems(config: NewsBlockConfig, lists: NewsItem[][]): NewsItem[] {
  return lists
    .flat()
    .filter((item) => passesFilters(item, config.includeTerms, config.excludeTerms))
    .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
    .slice(0, config.maxItems)
}

/** Items last stored on disk for the configured feeds, for an instant display before the network answers. */
export async function readCachedNews(config: NewsBlockConfig): Promise<NewsItem[]> {
  const lists = await Promise.all(
    config.feeds.map((f) => readStoredJson<NewsItem[]>(storageKey(f.url, f.title))),
  )
  return mergeItems(config, lists.map((l) => l ?? []))
}

/**
 * Merges all feeds, newest first. A failing feed does not prevent the others from showing,
 * and falls back to its last stored items (e.g. when offline).
 */
export async function fetchNews(config: NewsBlockConfig): Promise<NewsResult> {
  // The cache must expire before the next scheduled refresh, otherwise that refresh would be a no-op.
  const ttlMs = Math.min(MAX_CACHE_TTL_MS, (config.refreshMinutes * 60 * 1000) / 2)
  const results = await Promise.allSettled(config.feeds.map((f) => fetchFeed(f.url, ttlMs, f.title)))
  const lists = await Promise.all(
    results.map(async (r, i) => {
      if (r.status === 'fulfilled') return r.value
      const feed = config.feeds[i]!
      return (await readStoredJson<NewsItem[]>(storageKey(feed.url, feed.title))) ?? []
    }),
  )
  return {
    items: mergeItems(config, lists),
    failedFeeds: results.filter((r) => r.status === 'rejected').length,
  }
}
