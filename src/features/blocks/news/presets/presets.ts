import fr from './feeds.fr.json'
import en from './feeds.en.json'

export interface PresetFeed {
  title: string
  url: string
}

export interface PresetCategory {
  id: string
  feeds: PresetFeed[]
}

const presets: Record<string, { categories: PresetCategory[] }> = { fr, en }

/** Predefined feeds for a locale, falling back to English. */
export function getPresetCategories(locale: string): PresetCategory[] {
  return (presets[locale] ?? en).categories
}
