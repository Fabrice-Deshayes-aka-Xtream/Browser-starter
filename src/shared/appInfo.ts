import { version } from '../../package.json'

export const REPOSITORY_URL = 'https://github.com/Fabrice-Deshayes-aka-Xtream/Browser-starter'

export const APP_INFO = {
  version,
  buildDate: __BUILD_DATE__,
  author: 'Fabrice Deshayes aka Xtream',
  licenseUrl: `${REPOSITORY_URL}/blob/main/LICENSE`,
  changelogUrl: `${REPOSITORY_URL}/blob/main/CHANGELOG.md`,
  repositoryUrl: REPOSITORY_URL,
  buyMeACoffeeUrl: 'https://www.buymeacoffee.com/fabrice.aka.xtream',
}

export const OPEN_SOURCE_COMPONENTS = [
  { name: 'Vue', description: 'Progressive JavaScript framework', url: 'https://vuejs.org' },
  { name: 'Pinia', description: 'State management', url: 'https://pinia.vuejs.org' },
  { name: 'Vue I18n', description: 'Internationalization', url: 'https://vue-i18n.intlify.dev' },
  { name: 'Zod', description: 'Schema validation', url: 'https://zod.dev' },
  {
    name: 'SortableJS',
    description: 'Drag and drop lists',
    url: 'https://sortablejs.github.io/Sortable',
  },
  { name: 'VueUse', description: 'Vue composition utilities', url: 'https://vueuse.org' },
  { name: 'Simple Icons', description: 'Brand logos', url: 'https://simpleicons.org' },
  { name: 'Open-Meteo', description: 'Free weather API', url: 'https://open-meteo.com' },
]
