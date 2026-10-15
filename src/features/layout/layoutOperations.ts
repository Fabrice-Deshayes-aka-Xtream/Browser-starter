import { createId } from '@/core/config/defaults'
import type { Block, Column } from '@/core/config/schema'

export const MAX_COLUMNS = 8
export const MIN_COLUMN_WEIGHT = 0.25
export const MIN_BLOCK_HEIGHT = 80

export function addColumn(columns: Column[]): Column[] {
  if (columns.length >= MAX_COLUMNS) return columns
  const average = columns.reduce((sum, c) => sum + c.width, 0) / Math.max(columns.length, 1)
  return [...columns, { id: createId(), width: average || 1, blocks: [] }]
}

/** Removes a column; its blocks are appended to the previous column (or the next one for the first). */
export function removeColumn(columns: Column[], id: string): Column[] {
  const index = columns.findIndex((c) => c.id === id)
  if (index === -1 || columns.length <= 1) return columns
  const removed = columns[index]!
  const heirIndex = index > 0 ? index - 1 : 1
  return columns
    .map((c, i) => (i === heirIndex ? { ...c, blocks: [...c.blocks, ...removed.blocks] } : c))
    .filter((c) => c.id !== id)
}

export function setColumnCount(columns: Column[], count: number): Column[] {
  const target = Math.min(Math.max(count, 1), MAX_COLUMNS)
  let result = columns
  while (result.length < target) result = addColumn(result)
  while (result.length > target) result = removeColumn(result, result[result.length - 1]!.id)
  return result
}

/** Moves the border between column `index` and `index + 1` by `delta` weight units. */
export function resizeColumns(columns: Column[], index: number, delta: number): Column[] {
  const left = columns[index]
  const right = columns[index + 1]
  if (!left || !right) return columns
  const clamped = Math.min(
    Math.max(delta, MIN_COLUMN_WEIGHT - left.width),
    right.width - MIN_COLUMN_WEIGHT,
  )
  return columns.map((c, i) => {
    if (i === index) return { ...c, width: left.width + clamped }
    if (i === index + 1) return { ...c, width: right.width - clamped }
    return c
  })
}

export function moveColumn(columns: Column[], from: number, to: number): Column[] {
  if (from === to || !columns[from] || to < 0 || to >= columns.length) return columns
  const result = [...columns]
  result.splice(to, 0, result.splice(from, 1)[0]!)
  return result
}

export function addBlock(columns: Column[], columnId: string, block: Block): Column[] {
  return columns.map((c) => (c.id === columnId ? { ...c, blocks: [...c.blocks, block] } : c))
}

/** Deep-copies a block, giving fresh ids to it and to the items it contains. */
export function cloneBlock(block: Block): Block {
  const copy = JSON.parse(JSON.stringify(block)) as Block
  copy.id = createId()
  if (copy.type === 'bookmarks') copy.config.links.forEach((l) => (l.id = createId()))
  if (copy.type === 'news') copy.config.feeds.forEach((f) => (f.id = createId()))
  return copy
}

export function removeBlock(columns: Column[], blockId: string): Column[] {
  return columns.map((c) => ({ ...c, blocks: c.blocks.filter((b) => b.id !== blockId) }))
}

export function moveBlock(
  columns: Column[],
  blockId: string,
  toColumnId: string,
  toIndex: number,
): Column[] {
  const block = columns.flatMap((c) => c.blocks).find((b) => b.id === blockId)
  if (!block) return columns
  return removeBlock(columns, blockId).map((c) => {
    if (c.id !== toColumnId) return c
    const blocks = [...c.blocks]
    blocks.splice(Math.min(Math.max(toIndex, 0), blocks.length), 0, block)
    return { ...c, blocks }
  })
}

export function moveBookmark(
  columns: Column[],
  linkId: string,
  fromBlockId: string,
  toBlockId: string,
  toIndex: number,
): Column[] {
  const bookmarkBlocks = columns.flatMap((c) => c.blocks).filter((b) => b.type === 'bookmarks')
  const from = bookmarkBlocks.find((b) => b.id === fromBlockId)
  const to = bookmarkBlocks.find((b) => b.id === toBlockId)
  const link = from?.config.links.find((l) => l.id === linkId)
  if (!from || !to || !link || from === to) return columns
  return columns.map((c) => ({
    ...c,
    blocks: c.blocks.map((b) => {
      if (b.type !== 'bookmarks') return b
      if (b.id === fromBlockId) {
        return {
          ...b,
          config: { ...b.config, links: b.config.links.filter((l) => l.id !== linkId) },
        }
      }
      if (b.id === toBlockId) {
        const links = [...b.config.links]
        links.splice(Math.min(Math.max(toIndex, 0), links.length), 0, link)
        return { ...b, config: { ...b.config, links } }
      }
      return b
    }),
  }))
}

export function setBlockHeight(
  columns: Column[],
  blockId: string,
  height: number | null,
): Column[] {
  const value = height === null ? null : Math.max(Math.round(height), MIN_BLOCK_HEIGHT)
  return mapBlock(columns, blockId, (b) => ({ ...b, height: value }))
}

export function updateBlockConfig(
  columns: Column[],
  blockId: string,
  config: Block['config'],
): Column[] {
  return mapBlock(columns, blockId, (b) => ({ ...b, config }) as Block)
}

function mapBlock(columns: Column[], blockId: string, fn: (block: Block) => Block): Column[] {
  return columns.map((c) => ({ ...c, blocks: c.blocks.map((b) => (b.id === blockId ? fn(b) : b)) }))
}
