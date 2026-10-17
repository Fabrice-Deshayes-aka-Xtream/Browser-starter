import {describe, expect, it} from 'vitest'
import type {NewsItem} from './feedParser'
import {passesFilters} from './newsApi'

const item = (title: string): NewsItem => ({title, link: 'https://x.test/a', source: 'S'})

describe('passesFilters', () => {
  it('keeps everything when no term is given', () => {
    expect(passesFilters(item('Anything'), [], [])).toBe(true)
    expect(passesFilters(item('Anything'), ['  ', ''], [''])).toBe(true)
  })

  it('includes only titles containing one of the terms, ignoring case and accents', () => {
    expect(passesFilters(item('Élections en France'), ['football', 'elections'], [])).toBe(true)
    expect(passesFilters(item('Météo du jour'), ['football', 'elections'], [])).toBe(false)
  })

  it('excludes titles containing one of the terms', () => {
    expect(passesFilters(item('Le football en direct'), [], ['Football'])).toBe(false)
    expect(passesFilters(item('Le tennis en direct'), [], ['football'])).toBe(true)
  })

  it('matches multi-word terms as a whole string', () => {
    expect(passesFilters(item('Le chapeau pontu de Toto'), ['chapeau pontu'], [])).toBe(true)
    expect(passesFilters(item('Un chapeau très pontu'), ['chapeau pontu'], [])).toBe(false)
    expect(passesFilters(item('Un chapeau   pontu'), ['chapeau pontu'], [])).toBe(true)
  })

  it('lets exclusion win over inclusion', () => {
    expect(passesFilters(item('Football et tennis'), ['football'], ['tennis'])).toBe(false)
  })
})
