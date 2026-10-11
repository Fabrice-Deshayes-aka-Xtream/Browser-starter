import { describe, expect, it } from 'vitest'
import { DEFAULT_ENGINES } from '@/core/config/defaultEngines'
import { buildSearchUrl, toEngineView } from './engines'

describe('buildSearchUrl', () => {
  it('encodes the query into the template', () => {
    expect(buildSearchUrl('https://x.test/?q={query}', ' a&b c ')).toBe(
      'https://x.test/?q=a%26b%20c',
    )
  })

  it('has a {query} placeholder in every default engine', () => {
    for (const engine of DEFAULT_ENGINES) expect(engine.urlTemplate).toContain('{query}')
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
