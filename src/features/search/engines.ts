import {
  siDuckduckgo,
  siGithub,
  siGoogle,
  siImdb,
  siPerplexity,
  siWikipedia,
  siYoutube,
} from 'simple-icons'
import type { SearchEngine } from '@/core/config/schema'
import { BROWSER_ENGINE_ID } from '@/core/config/defaultEngines'

export interface EngineView extends SearchEngine {
  color: string
  /** SVG path (24x24 viewBox) of the brand mark; absent for custom engines. */
  iconPath?: string
}

// Simple Icons does not ship Amazon and Bing marks, so simplified ones are drawn here.
const AMAZON_PATH =
  'M11 6.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM11 8.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 1 1 0-3.6zM14.6 6.4h2v7.6h-2zM3.5 16.2c4.3 2.9 10 3.5 15.6.8l.3.7c-5.8 3-11.9 2.5-16.3-.6zM18.2 15.3l2.5-.6-.9 2.5z'
const SEARCH_PATH =
  'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
const BING_PATH = 'M5 3l4 1.4v12.1l5.6-3.2-2.8-1.3-1.7-4.3 9 3.2v4.2L9 21.2 5 19z'

const fromSimpleIcon = (icon: { hex: string; path: string }) => ({
  color: `#${icon.hex}`,
  iconPath: icon.path,
})

/** Brand visuals of the default engines, by engine id. */
const brandVisuals: Record<string, { color: string; iconPath: string }> = {
  google: fromSimpleIcon(siGoogle),
  duckduckgo: fromSimpleIcon(siDuckduckgo),
  bing: { color: '#008373', iconPath: BING_PATH },
  perplexity: fromSimpleIcon(siPerplexity),
  youtube: fromSimpleIcon(siYoutube),
  imdb: fromSimpleIcon(siImdb),
  amazon: { color: '#ff9900', iconPath: AMAZON_PATH },
  wikipedia: fromSimpleIcon(siWikipedia),
  github: fromSimpleIcon(siGithub),
  [BROWSER_ENGINE_ID]: { color: '#5f6368', iconPath: SEARCH_PATH },
}

/** Deterministic color for engines without a brand color. */
export function colorFromName(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return `hsl(${hash} 55% 45%)`
}

export function toEngineView(engine: SearchEngine): EngineView {
  const visual = brandVisuals[engine.id]
  return {
    ...engine,
    color: visual?.color ?? colorFromName(engine.name),
    iconPath: visual?.iconPath,
  }
}

export function buildSearchUrl(urlTemplate: string, query: string): string {
  return urlTemplate.replace('{query}', encodeURIComponent(query.trim()))
}

interface BrowserSearchApi {
  query?: (options: { text: string; disposition: string }) => void
}

/** Runs the search in a new tab; the browser engine uses the user's current default search engine. */
export function runSearch(engine: SearchEngine, query: string): void {
  const text = query.trim()
  if (text === '') return
  if (engine.urlTemplate) {
    window.open(buildSearchUrl(engine.urlTemplate, text), '_blank', 'noopener,noreferrer')
    return
  }
  const api = (globalThis as { chrome?: { search?: BrowserSearchApi } }).chrome?.search
  if (api?.query) api.query({ text, disposition: 'NEW_TAB' })
  // Outside an extension (e.g. dev server) there is no browser search API.
  else window.open(buildSearchUrl(FALLBACK_URL_TEMPLATE, text), '_blank', 'noopener,noreferrer')
}

const FALLBACK_URL_TEMPLATE = 'https://www.google.com/search?q={query}'
