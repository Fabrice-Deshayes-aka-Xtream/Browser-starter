import type {AppConfig} from '@/core/config/schema'
import {
  FAVICON_PREFIX,
  NEWS_PREFIX,
  newsKey,
  TODAY_PREFIX,
  todayKey,
  WEATHER_PREFIX,
  weatherKey,
} from './cacheKeys'
import {getStorageAdapter} from './storageAdapter'

const FAVICON_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const CONFIG_BOUND_PREFIXES = [NEWS_PREFIX, WEATHER_PREFIX, TODAY_PREFIX]

/** Cache keys still referenced by a block of any workspace. */
function usedKeys(config: AppConfig): Set<string> {
  const keys = new Set<string>()
  const blocks = config.workspaces.flatMap((w) => w.layout.columns.flatMap((c) => c.blocks))
  for (const block of blocks) {
    if (block.type === 'news') {
      for (const feed of block.config.feeds) keys.add(newsKey(feed.url, feed.title))
    } else if (block.type === 'weather') {
      const {city, forecastDays, unit} = block.config
      if (city) keys.add(weatherKey(city, forecastDays, unit))
    } else if (block.type === 'today') {
      for (const calendar of block.config.calendars) keys.add(todayKey(calendar.url))
    }
  }
  return keys
}

/**
 * Removes cache entries no block refers to anymore (deleted feeds, changed city, calendar URL...)
 * and site favicons that have not been refreshed for a long time, i.e. unused.
 */
export async function pruneCache(config: AppConfig, now = Date.now()): Promise<void> {
  try {
    const storage = getStorageAdapter()
    const used = usedKeys(config)
    for (const key of await storage.keys()) {
      if (key.startsWith(FAVICON_PREFIX)) {
        let time = 0
        try {
          time = (JSON.parse((await storage.get(key)) ?? 'null') as {
            time?: number
          } | null)?.time ?? 0
        } catch {
          // Unreadable entry: treated as expired.
        }
        if (now - time > FAVICON_MAX_AGE_MS) await storage.remove(key)
      } else if (CONFIG_BOUND_PREFIXES.some((p) => key.startsWith(p)) && !used.has(key)) {
        await storage.remove(key)
      }
    }
  } catch {
    // Cleanup is best-effort.
  }
}
