import { afterEach, describe, expect, it, vi } from 'vitest'
import { BROWSER_ENGINE_ID, DEFAULT_ENGINES } from '@/core/config/defaultEngines'
import { createDefaultConfig } from '@/core/config/defaults'
import { ensureBrowserEngine } from '@/core/stores/configStore'
import { buildSearchUrl, runSearch, toEngineView } from './engines'

describe('buildSearchUrl', () => {
  it('encodes the query into the template', () => {
    expect(buildSearchUrl('https://x.test/?q={query}', ' a&b c ')).toBe(
      'https://x.test/?q=a%26b%20c',
    )
  })

  it('has a {query} placeholder in every default engine except the browser one', () => {
    for (const engine of DEFAULT_ENGINES.filter((e) => e.id !== BROWSER_ENGINE_ID))
      expect(engine.urlTemplate).toContain('{query}')
    expect(DEFAULT_ENGINES[0]!.urlTemplate).toBeUndefined()
  })
})

describe('runSearch', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('delegates the browser engine to chrome.search', () => {
    const query = vi.fn<() => void>()
    vi.stubGlobal('chrome', { search: { query } })
    runSearch(DEFAULT_ENGINES[0]!, ' hello ')
    expect(query).toHaveBeenCalledWith({ text: 'hello', disposition: 'NEW_TAB' })
  })

  it('opens the URL of engines with a template', () => {
    const open = vi.fn<() => void>()
    vi.stubGlobal('window', { open })
    runSearch({ id: 'x', name: 'X', urlTemplate: 'https://x.test/?q={query}' }, 'a b')
    expect(open).toHaveBeenCalledWith('https://x.test/?q=a%20b', '_blank', 'noopener,noreferrer')
  })
})

describe('ensureBrowserEngine', () => {
  it('adds the browser engine once to configurations saved without it', () => {
    const config = createDefaultConfig()
    const search = config.workspaces[0]!.search
    search.engines = search.engines.filter((e) => e.id !== BROWSER_ENGINE_ID)
    ensureBrowserEngine(config)
    ensureBrowserEngine(config)
    expect(search.engines.filter((e) => e.id === BROWSER_ENGINE_ID)).toHaveLength(1)
  })
})

describe('toEngineView', () => {
  it('gives default engines their brand logo and custom ones a letter fallback', () => {
    expect(toEngineView(DEFAULT_ENGINES[0]!).iconPath).toBeTruthy()
    expect(
      toEngineView({ id: 'x', name: 'Mine', urlTemplate: 'https://m.test/?q={query}' }).iconPath,
    ).toBeUndefined()
  })
})
