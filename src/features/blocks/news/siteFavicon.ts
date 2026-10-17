import {faviconKey} from '@/core/storage/cacheKeys'
import {readStoredJson, writeStoredJson} from '@/core/storage/jsonCache'
import {fetchFavicon} from '../bookmarks/favicon'

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const cache = new Map<string, Promise<string | undefined>>()

interface StoredFavicon {
  icon: string
  time: number
}

async function resolve(origin: string): Promise<string | undefined> {
  const key = faviconKey(origin)
  const stored = await readStoredJson<StoredFavicon>(key)
  if (stored && Date.now() - stored.time < MAX_AGE_MS) return stored.icon

  const icon = await fetchFavicon(origin).catch(() => undefined)
  if (!icon) return stored?.icon
  await writeStoredJson(key, {icon, time: Date.now()} satisfies StoredFavicon)
  return icon
}

/** Resolves a site's favicon, memoized per origin and persisted on disk (refreshed weekly, kept when offline). */
export function getSiteFavicon(origin: string): Promise<string | undefined> {
  let promise = cache.get(origin)
  if (!promise) {
    promise = resolve(origin)
    cache.set(origin, promise)
  }
  return promise
}
