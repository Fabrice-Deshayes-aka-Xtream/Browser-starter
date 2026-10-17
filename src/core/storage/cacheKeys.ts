/** Storage keys of the on-disk caches, shared by the blocks that write them and the cleanup. */
export const NEWS_PREFIX = 'browser-starter.news.'
export const WEATHER_PREFIX = 'browser-starter.weather.'
export const TODAY_PREFIX = 'browser-starter.today.events.'
export const FAVICON_PREFIX = 'browser-starter.favicon.'

export const newsKey = (url: string, title?: string) => `${NEWS_PREFIX}${url}|${title ?? ''}`

export const weatherKey = (
  city: { latitude: number; longitude: number },
  forecastDays: number,
  unit: string,
) => `${WEATHER_PREFIX}${city.latitude},${city.longitude},${forecastDays},${unit}`

export const todayKey = (icalUrl: string) =>
  `${TODAY_PREFIX}${icalUrl.trim().replace(/^webcal:/i, 'https:')}`

export const faviconKey = (origin: string) => `${FAVICON_PREFIX}${origin}`
