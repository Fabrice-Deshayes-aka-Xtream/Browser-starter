import type { Component } from 'vue'
import { createId } from '@/core/config/defaults'
import type { Block, BlockType } from '@/core/config/schema'
import BookmarksBlock from './bookmarks/BookmarksBlock.vue'
import NewsBlock from './news/NewsBlock.vue'
import NewsEditor from './news/NewsEditor.vue'
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
    createConfig: () => ({ city: null, forecastDays: 5, unit: 'celsius' }),
  },
  {
    type: 'news',
    i18nKey: 'blocks.news',
    component: NewsBlock,
    editor: NewsEditor,
    resizable: false,
    createConfig: () => ({ title: '', feeds: [], maxItems: 10, showThumbnails: true }),
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
