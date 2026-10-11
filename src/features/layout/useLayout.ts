import { computed } from 'vue'
import { useConfigStore } from '@/core/stores/configStore'
import type { BlockType, Column } from '@/core/config/schema'
import { createBlock } from '@/features/blocks/blockRegistry'
import * as ops from './layoutOperations'

export function useLayout() {
  const store = useConfigStore()
  const columns = computed(() => store.workspace.layout.columns)

  function apply(next: Column[]) {
    store.workspace.layout.columns = next
  }

  const margin = computed(() => store.workspace.layout.margin)

  return {
    columns,
    margin,
    setMargin: (value: number | undefined) => {
      store.workspace.layout.margin = value
    },
    setColumns: apply,
    moveColumn: (from: number, to: number) => apply(ops.moveColumn(columns.value, from, to)),
    addColumn: () => apply(ops.addColumn(columns.value)),
    removeColumn: (id: string) => apply(ops.removeColumn(columns.value, id)),
    setColumnCount: (count: number) => apply(ops.setColumnCount(columns.value, count)),
    addBlock: (columnId: string, type: BlockType) => {
      const block = createBlock(type)
      apply(ops.addBlock(columns.value, columnId, block))
      return block
    },
    removeBlock: (id: string) => apply(ops.removeBlock(columns.value, id)),
    moveBlock: (id: string, columnId: string, index: number) =>
      apply(ops.moveBlock(columns.value, id, columnId, index)),
    setBlockHeight: (id: string, height: number | null) =>
      apply(ops.setBlockHeight(columns.value, id, height)),
    moveBookmark: (linkId: string, fromBlockId: string, toBlockId: string, toIndex: number) =>
      apply(ops.moveBookmark(columns.value, linkId, fromBlockId, toBlockId, toIndex)),
    updateBlockConfig: (id: string, config: Parameters<typeof ops.updateBlockConfig>[2]) =>
      apply(ops.updateBlockConfig(columns.value, id, config)),
  }
}
