import type {Component} from 'vue'
import {createId} from '@/core/config/defaults'
import type {Block, BlockType} from '@/core/config/schema'
import BookmarksBlock from './bookmarks/BookmarksBlock.vue'
import NewsBlock from './news/NewsBlock.vue'
import NewsEditor from './news/NewsEditor.vue'
import TodayBlock from './today/TodayBlock.vue'
import TodayEditor from './today/TodayEditor.vue'
import WeatherBlock from './weather/WeatherBlock.vue'
import WeatherEditor from './weather/WeatherEditor.vue'

export interface BlockDefinition {
  type: BlockType
  /** i18n key prefix: `<prefix>.name` and `<prefix>.description`. */
  i18nKey: string
  /** Read-only view of the block. */
  component: Component
  /** Optional configuration form; receives `config` and emits `save`. */
  editor?: Component
  /** Width of the editor dialog (CSS length); defaults to 28rem. */
  editorWidth?: string
  /** Whether the user can set a fixed height; otherwise the block fits its content. */
  resizable: boolean
  createConfig: () => Block['config']
}

export const blockDefinitions: BlockDefinition[] = [
  {
    type: 'bookmarks',
    i18nKey: 'blocks.bookmarks',
    component: BookmarksBlock,
    resizable: false,
    createConfig: () => ({ title: '', display: 'list', tileSize: 'normal', links: [] }),
  },
  {
    type: 'weather',
    i18nKey: 'blocks.weather',
    component: WeatherBlock,
    editor: WeatherEditor,
    resizable: false,
    createConfig: () => ({city: null, forecastDays: 5, unit: 'celsius', refreshMinutes: 30}),
  },
  {
    type: 'today',
    i18nKey: 'blocks.today',
    component: TodayBlock,
    editor: TodayEditor,
    resizable: false,
    createConfig: () => ({
      showDate: true,
      showTime: true,
      timezones: [],
      showEvents: false,
      calendars: [],
      eventCount: 5,
    }),
  },
  {
    type: 'news',
    i18nKey: 'blocks.news',
    component: NewsBlock,
    editor: NewsEditor,
    editorWidth: '52rem',
    resizable: false,
    createConfig: () => ({
      title: '',
      feeds: [],
      maxItems: 10,
      visibleItems: 5,
      includeTerms: [],
      excludeTerms: [],
      itemIcon: 'thumbnail',
      refreshMinutes: 15,
    }),
  },
]

export function getBlockDefinition(type: BlockType): BlockDefinition {
  return blockDefinitions.find((d) => d.type === type)!
}

export function createBlock(type: BlockType): Block {
  return {
    id: createId(),
    type,
    height: null,
    config: getBlockDefinition(type).createConfig(),
  } as Block
}
