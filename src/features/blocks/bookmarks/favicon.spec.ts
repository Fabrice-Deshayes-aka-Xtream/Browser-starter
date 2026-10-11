import { describe, expect, it } from 'vitest'
import { domainTitle, findIconUrls, normalizeUrl } from './favicon'

describe('domainTitle', () => {
  it('returns the domain name without subdomain nor public suffix', () => {
    expect(domainTitle('https://commons.wikimedia.org/wiki/Accueil')).toBe('wikimedia')
    expect(domainTitle('https://www.example.com/path')).toBe('example')
    expect(domainTitle('https://news.bbc.co.uk/')).toBe('bbc')
    expect(domainTitle('http://localhost:3000/')).toBe('localhost')
  })
})

describe('findIconUrls', () => {
  it('resolves declared icons and appends the default location', () => {
    const html = `<html><head>
      <link rel="shortcut icon" href="/static/a.png">
      <link rel="apple-touch-icon" href="https://cdn.test/b.png">
    </head></html>`
    expect(findIconUrls(html, 'https://site.test/page')).toEqual([
      'https://site.test/static/a.png',
      'https://cdn.test/b.png',
      'https://site.test/favicon.ico',
    ])
  })

  it('falls back to /favicon.ico when nothing is declared', () => {
    expect(findIconUrls('<html></html>', 'https://site.test/x')).toEqual([
      'https://site.test/favicon.ico',
    ])
  })
})

describe('normalizeUrl', () => {
  it('adds https and rejects invalid or non-http input', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/')
    expect(normalizeUrl('http://a.test/x')).toBe('http://a.test/x')
    expect(normalizeUrl('javascript:alert(1)')).toBeNull()
    expect(normalizeUrl('  ')).toBeNull()
  })
})
