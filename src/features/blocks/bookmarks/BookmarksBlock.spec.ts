import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Block } from '@/core/config/schema'
import { i18n } from '@/shared/i18n'

const moveBookmark = vi.hoisted(() => vi.fn<(...args: unknown[]) => void>())
const sortableOptions = vi.hoisted(() => [] as Record<string, unknown>[])

vi.mock('sortablejs', () => ({
  default: {
    create: (_el: HTMLElement, options: Record<string, unknown>) => {
      sortableOptions.push(options)
      return { option: vi.fn<() => void>(), destroy: vi.fn<() => void>() }
    },
  },
}))
vi.mock('@/features/layout/useLayout', () => ({ useLayout: () => ({ moveBookmark }) }))

import BookmarksBlock from './BookmarksBlock.vue'

function makeBlock(id: string, linkIds: string[]) {
  return {
    id,
    type: 'bookmarks',
    config: {
      title: id,
      display: 'list',
      tileSize: 'small',
      links: linkIds.map((l) => ({ id: l, title: l, url: `https://${l}.test` })),
    },
  } as unknown as Extract<Block, { type: 'bookmarks' }>
}

function mountBlock(block: Extract<Block, { type: 'bookmarks' }>) {
  return mount(BookmarksBlock, {
    props: { block, editing: true },
    global: { plugins: [i18n] },
    attachTo: document.body,
  })
}

describe('BookmarksBlock drag & drop between blocks', () => {
  beforeEach(() => {
    moveBookmark.mockClear()
    sortableOptions.length = 0
  })

  it('exposes the block id on the sortable list so a transfer can identify its blocks', () => {
    const wrapper = mountBlock(makeBlock('block-a', ['l1']))
    expect(wrapper.find('ul.links').attributes('data-block-id')).toBe('block-a')
  })

  it('moves a bookmark from one block to another', () => {
    const a = mountBlock(makeBlock('block-a', ['l1', 'l2']))
    const b = mountBlock(makeBlock('block-b', ['l3']))
    const from = a.find('ul.links').element as HTMLElement
    const to = b.find('ul.links').element as HTMLElement
    const item = from.children[0] as HTMLElement

    const onEnd = sortableOptions[0]!.onEnd as (e: unknown) => void
    onEnd({ item, from, to, oldIndex: 0, newIndex: 1 })

    expect(moveBookmark).toHaveBeenCalledWith('l1', 'block-a', 'block-b', 1)
  })
})
