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

export interface EngineView extends SearchEngine {
  color: string
  /** SVG path (24x24 viewBox) of the brand mark; absent for custom engines. */
  iconPath?: string
}

// Simple Icons does not ship Amazon and Bing marks, so simplified ones are drawn here.
const AMAZON_PATH =
  'M11 6.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 1 0 0-7.2zM11 8.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 1 1 0-3.6zM14.6 6.4h2v7.6h-2zM3.5 16.2c4.3 2.9 10 3.5 15.6.8l.3.7c-5.8 3-11.9 2.5-16.3-.6zM18.2 15.3l2.5-.6-.9 2.5z'
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
