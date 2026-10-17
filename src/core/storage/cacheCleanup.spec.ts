import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {createDefaultConfig} from '@/core/config/defaults'
import type {AppConfig} from '@/core/config/schema'
import {faviconKey, newsKey, todayKey, weatherKey} from './cacheKeys'
import {pruneCache} from './cacheCleanup'

const DAY = 24 * 60 * 60 * 1000

describe('pruneCache', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      get length() {
        return store.size
      },
      key: (i: number) => [...store.keys()][i] ?? null,
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('drops unreferenced caches and expired favicons, keeps the rest', async () => {
    const config = createDefaultConfig() as AppConfig
    const column = config.workspaces[0]!.layout.columns[0]!
    column.blocks = [
      {
        id: 'n',
        type: 'news',
        height: null,
        config: {
          title: '',
          feeds: [{id: 'f', url: 'https://a.test/rss'}],
          maxItems: 5,
          includeTerms: [],
          excludeTerms: [],
          itemIcon: 'thumbnail',
          refreshMinutes: 15,
        },
      },
      {
        id: 't',
        type: 'today',
        height: null,
        config: {
          showDate: true,
          showTime: true,
          timezones: [],
          showEvents: true,
          calendars: [{id: 'c', url: 'webcal://cal.test/x.ics'}],
          eventCount: 5,
        },
      },
    ]
    const now = Date.now()
    const city = {latitude: 1, longitude: 2}
    store.set('browser-starter.config', '{}')
    store.set(newsKey('https://a.test/rss'), '[]')
    store.set(newsKey('https://removed.test/rss'), '[]')
    store.set(weatherKey(city, 5, 'celsius'), '{}')
    store.set(todayKey('https://cal.test/x.ics'), '[]')
    store.set(faviconKey('https://fresh.test'), JSON.stringify({icon: 'x', time: now - DAY}))
    store.set(faviconKey('https://old.test'), JSON.stringify({icon: 'x', time: now - 40 * DAY}))

    await pruneCache(config, now)

    expect([...store.keys()].sort()).toEqual(
      [
        'browser-starter.config',
        newsKey('https://a.test/rss'),
        todayKey('https://cal.test/x.ics'),
        faviconKey('https://fresh.test'),
      ].sort(),
    )
  })
})
