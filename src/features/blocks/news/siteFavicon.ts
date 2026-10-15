import { fetchFavicon } from '../bookmarks/favicon'

const cache = new Map<string, Promise<string | undefined>>()

/** Resolves (and memoizes per origin) the favicon of a site. */
export function getSiteFavicon(origin: string): Promise<string | undefined> {
  let promise = cache.get(origin)
  if (!promise) {
    promise = fetchFavicon(origin).catch(() => undefined)
    cache.set(origin, promise)
  }
  return promise
}
