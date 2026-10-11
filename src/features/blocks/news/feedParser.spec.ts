import { describe, expect, it } from 'vitest'
import { parseFeed } from './feedParser'

const rss = `<?xml version="1.0"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>Example</title>
  <item><title>First</title><link>/a</link><pubDate>Mon, 05 Jan 2026 10:00:00 GMT</pubDate>
    <media:thumbnail url="https://img.test/a.jpg"/></item>
  <item><title>Bad link</title><link>javascript:alert(1)</link></item>
</channel></rss>`

const atom = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Atom feed</title>
  <entry><title>Entry</title><link rel="alternate" href="https://site.test/e"/>
    <updated>2026-01-05T10:00:00Z</updated></entry>
</feed>`

describe('parseFeed', () => {
  it('parses RSS items, resolving links and ignoring unsafe ones', () => {
    const items = parseFeed(rss, 'https://example.test/feed.xml')
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      title: 'First',
      link: 'https://example.test/a',
      source: 'Example',
      image: 'https://img.test/a.jpg',
      date: Date.parse('2026-01-05T10:00:00Z'),
    })
  })

  it('parses Atom entries', () => {
    const items = parseFeed(atom, 'https://site.test/atom')
    expect(items[0]).toMatchObject({
      title: 'Entry',
      link: 'https://site.test/e',
      source: 'Atom feed',
    })
  })

  it('uses the custom title as source', () => {
    expect(parseFeed(atom, 'https://site.test/atom', 'Mine')[0]!.source).toBe('Mine')
  })

  it('rejects documents that are not XML', () => {
    expect(() => parseFeed('<html><body>nope', 'https://x.test')).toThrow('Invalid feed')
  })
})
