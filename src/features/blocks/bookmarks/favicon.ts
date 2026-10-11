import { parse } from 'tldts'
import { blobToIconDataUrl } from '@/shared/utils/image'

const REQUEST_TIMEOUT_MS = 5000

/** Lists candidate icon URLs declared by a page, best candidates first, ending with `/favicon.ico`. */
export function findIconUrls(html: string, pageUrl: string): string[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const declared = [
    ...doc.querySelectorAll('link[rel~="icon"]'),
    ...doc.querySelectorAll('link[rel="apple-touch-icon"]'),
  ]
    .map((link) => link.getAttribute('href'))
    .filter((href): href is string => !!href)
    .map((href) => new URL(href, pageUrl).href)

  return [...new Set([...declared, new URL('/favicon.ico', pageUrl).href])]
}

async function fetchBlob(url: string): Promise<Blob> {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.blob()
}

/** Resolves a site's favicon as a small data URL, or `undefined` when none can be loaded. */
export async function fetchFavicon(pageUrl: string): Promise<string | undefined> {
  let candidates = [new URL('/favicon.ico', pageUrl).href]
  try {
    const html = await (
      await fetch(pageUrl, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    ).text()
    candidates = findIconUrls(html, pageUrl)
  } catch {
    // The page itself is unreachable: fall back to the default location.
  }

  for (const candidate of candidates) {
    try {
      return await blobToIconDataUrl(await fetchBlob(candidate))
    } catch {
      // Try the next candidate.
    }
  }
  return undefined
}

/** Default bookmark title: the registrable domain without its public suffix (e.g. `wikimedia`). */
export function domainTitle(url: string): string {
  const { domainWithoutSuffix, hostname } = parse(url)
  return domainWithoutSuffix || hostname || ''
}

/** Adds `https://` when the user typed a bare domain; returns `null` for invalid input. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
