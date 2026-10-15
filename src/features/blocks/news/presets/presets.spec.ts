import { describe, expect, it } from 'vitest'
import { getPresetCategories } from './presets'

describe('feed presets', () => {
  const fr = getPresetCategories('fr')
  const en = getPresetCategories('en')

  it('has at least 5 categories with feeds per language', () => {
    for (const cats of [fr, en]) {
      expect(cats.length).toBeGreaterThanOrEqual(5)
      for (const c of cats) expect(c.feeds.length).toBeGreaterThan(0)
    }
  })

  it('uses the same category ids in every language', () => {
    expect(fr.map((c) => c.id)).toEqual(en.map((c) => c.id))
  })

  it('has valid https urls without duplicates', () => {
    for (const cats of [fr, en]) {
      const urls = cats.flatMap((c) => c.feeds.map((f) => f.url))
      expect(new Set(urls).size).toBe(urls.length)
      for (const url of urls) expect(url).toMatch(/^https:\/\/.+/)
    }
  })

  it('falls back to English for unknown locales', () => {
    expect(getPresetCategories('de')).toEqual(en)
  })
})
