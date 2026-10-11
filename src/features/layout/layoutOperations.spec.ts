import { describe, expect, it } from 'vitest'
import type { Block, Column } from '@/core/config/schema'
import {
  addBlock,
  moveBlock,
  moveColumn,
  removeColumn,
  resizeColumns,
  setBlockHeight,
  setColumnCount,
} from './layoutOperations'

const block = (id: string): Block => ({
  id,
  type: 'bookmarks',
  height: null,
  config: { title: id, display: 'list', tileSize: 'normal', links: [] },
})
const column = (id: string, blocks: Block[] = [], width = 1): Column => ({ id, width, blocks })

describe('layoutOperations', () => {
  it('moves a column to another position', () => {
    const columns = [column('a'), column('b'), column('c')]
    expect(moveColumn(columns, 2, 0).map((c) => c.id)).toEqual(['c', 'a', 'b'])
    expect(moveColumn(columns, 0, 1).map((c) => c.id)).toEqual(['b', 'a', 'c'])
    expect(moveColumn(columns, 1, 5)).toBe(columns)
  })

  it('merges blocks of a removed column into the previous one', () => {
    const result = removeColumn([column('a', [block('1')]), column('b', [block('2')])], 'b')
    expect(result).toHaveLength(1)
    expect(result[0]!.blocks.map((b) => b.id)).toEqual(['1', '2'])
  })

  it('never removes the last column', () => {
    expect(removeColumn([column('a')], 'a')).toHaveLength(1)
  })

  it('adjusts the column count within bounds', () => {
    expect(setColumnCount([column('a')], 4)).toHaveLength(4)
    expect(setColumnCount([column('a')], 99)).toHaveLength(8)
    expect(setColumnCount([column('a'), column('b')], 0)).toHaveLength(1)
  })

  it('keeps the total weight and a minimum width when resizing', () => {
    const result = resizeColumns([column('a'), column('b')], 0, 5)
    expect(result[0]!.width + result[1]!.width).toBeCloseTo(2)
    expect(result[1]!.width).toBeCloseTo(0.25)
  })

  it('moves a block across columns at a given index', () => {
    const columns = [column('a', [block('1'), block('2')]), column('b', [block('3')])]
    const result = moveBlock(columns, '1', 'b', 0)
    expect(result[0]!.blocks.map((b) => b.id)).toEqual(['2'])
    expect(result[1]!.blocks.map((b) => b.id)).toEqual(['1', '3'])
  })

  it('adds a block and clamps its height', () => {
    let columns = addBlock([column('a')], 'a', block('1'))
    columns = setBlockHeight(columns, '1', 10)
    expect(columns[0]!.blocks[0]!.height).toBe(80)
  })
})
