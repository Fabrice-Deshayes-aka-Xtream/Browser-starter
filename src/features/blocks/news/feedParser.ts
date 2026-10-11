export interface NewsItem {
  title: string
  link: string
  /** Publication time in ms since epoch, when known. */
  date?: number
  image?: string
  source: string
}

const safeHttpUrl = (value: string | null | undefined, base?: string): string | undefined => {
  if (!value) return undefined
  try {
    const url = new URL(value.trim(), base)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
}

const text = (parent: Element, tag: string) =>
  parent.getElementsByTagName(tag)[0]?.textContent?.trim() || undefined

const parseDate = (value: string | undefined) => {
  const time = value ? Date.parse(value) : NaN
  return Number.isNaN(time) ? undefined : time
}

function imageFromRss(item: Element, base: string): string | undefined {
  for (const tag of ['media:thumbnail', 'media:content']) {
    const url = safeHttpUrl(item.getElementsByTagName(tag)[0]?.getAttribute('url'), base)
    if (url) return url
  }
  const enclosure = item.getElementsByTagName('enclosure')[0]
  if (enclosure?.getAttribute('type')?.startsWith('image/')) {
    return safeHttpUrl(enclosure.getAttribute('url'), base)
  }
  const html = text(item, 'description') ?? ''
  const src = /<img[^>]+src=["']([^"']+)["']/i.exec(html)?.[1]
  return safeHttpUrl(src, base)
}

/** Parses RSS 2.0 and Atom documents. `feedUrl` is used to resolve relative links. */
export function parseFeed(xml: string, feedUrl: string, titleOverride?: string): NewsItem[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Invalid feed')

  const channel = doc.querySelector('channel, feed')
  const source = titleOverride || (channel && text(channel, 'title')) || new URL(feedUrl).hostname
  const items: NewsItem[] = []

  for (const item of doc.getElementsByTagName('item')) {
    const link = safeHttpUrl(text(item, 'link'), feedUrl)
    const title = text(item, 'title')
    if (!link || !title) continue
    items.push({
      title,
      link,
      source,
      date: parseDate(text(item, 'pubDate') ?? text(item, 'dc:date')),
      image: imageFromRss(item, feedUrl),
    })
  }

  for (const entry of doc.getElementsByTagName('entry')) {
    const links = [...entry.getElementsByTagName('link')]
    const alternate = links.find(
      (l) => !l.getAttribute('rel') || l.getAttribute('rel') === 'alternate',
    )
    const link = safeHttpUrl(alternate?.getAttribute('href'), feedUrl)
    const title = text(entry, 'title')
    if (!link || !title) continue
    items.push({
      title,
      link,
      source,
      date: parseDate(text(entry, 'published') ?? text(entry, 'updated')),
      image: safeHttpUrl(
        entry.getElementsByTagName('media:thumbnail')[0]?.getAttribute('url'),
        feedUrl,
      ),
    })
  }

  return items
}
