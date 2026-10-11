import type { SearchEngine } from './schema'

export const DEFAULT_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', urlTemplate: 'https://www.google.com/search?q={query}' },
  { id: 'duckduckgo', name: 'DuckDuckGo', urlTemplate: 'https://duckduckgo.com/?q={query}' },
  { id: 'bing', name: 'Bing', urlTemplate: 'https://www.bing.com/search?q={query}' },
  {
    id: 'perplexity',
    name: 'Perplexity',
    urlTemplate: 'https://www.perplexity.ai/search?q={query}',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    urlTemplate: 'https://www.youtube.com/results?search_query={query}',
  },
  { id: 'imdb', name: 'IMDb', urlTemplate: 'https://www.imdb.com/find/?q={query}' },
  { id: 'amazon', name: 'Amazon', urlTemplate: 'https://www.amazon.com/s?k={query}' },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    urlTemplate: 'https://en.wikipedia.org/w/index.php?search={query}',
  },
  { id: 'github', name: 'GitHub', urlTemplate: 'https://github.com/search?q={query}' },
]
