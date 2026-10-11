<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import type { BlockType, Column } from '@/core/config/schema'
import { resizeColumns } from '../layoutOperations'
import { useEditMode } from '@/shared/composables/useEditMode'
import { useLayout } from '../useLayout'
import { newBlockId } from '../useNewBlock'
import { getBlockDefinition } from '@/features/blocks/blockRegistry'
import BlockPicker from './BlockPicker.vue'
import ColumnResizer from './ColumnResizer.vue'
import ColumnView from './ColumnView.vue'
import EdgeHandle from './EdgeHandle.vue'

const { editing } = useEditMode()
const layout = useLayout()

const grid = ref<HTMLElement>()
const frame = ref<HTMLElement>()
const pickerColumnId = ref<string | null>(null)
let snapshot: Column[] = []
let startMargin = 0

const MAX_MARGIN_PERCENT = 30

const frameStyle = computed(() => {
  const margin = layout.margin.value
  return margin === undefined ? undefined : { marginLeft: `${margin}%`, marginRight: `${margin}%` }
})

function takeSnapshot() {
  snapshot = layout.columns.value
}

function startEdge() {
  const rect = frame.value!.getBoundingClientRect()
  startMargin = (rect.left / document.documentElement.clientWidth) * 100
}

// The page stays centered: moving one edge moves the opposite one symmetrically.
function onEdgeMove(side: 'left' | 'right', dx: number) {
  const delta = ((side === 'left' ? dx : -dx) / document.documentElement.clientWidth) * 100
  const value = Math.min(MAX_MARGIN_PERCENT, Math.max(0, startMargin + delta))
  layout.setMargin(Math.round(value * 10) / 10)
}

function onResizeMove(index: number, dx: number) {
  const totalWeight = snapshot.reduce((sum, c) => sum + c.width, 0)
  const delta = (dx / (grid.value?.clientWidth || 1)) * totalWeight
  layout.setColumns(resizeColumns(snapshot, index, delta))
}

function onPick(type: BlockType) {
  if (pickerColumnId.value) {
    const block = layout.addBlock(pickerColumnId.value, type)
    if (getBlockDefinition(type).editor) newBlockId.value = block.id
  }
  pickerColumnId.value = null
}

let sortable: Sortable | undefined

onMounted(() => {
  sortable = Sortable.create(grid.value!, {
    draggable: '.column',
    handle: '.column-handle',
    animation: 150,
    disabled: !editing.value,
    onEnd: ({ item, from, oldIndex, oldDraggableIndex, newDraggableIndex }) => {
      // Vue owns the DOM: undo Sortable's move, then update the state and let Vue re-render.
      item.remove()
      from.insertBefore(item, from.children[oldIndex!] ?? null)
      layout.moveColumn(oldDraggableIndex!, newDraggableIndex!)
    },
  })
})

watch(editing, (value) => sortable?.option('disabled', !value))
onBeforeUnmount(() => sortable?.destroy())
</script>

<template>
  <div
    ref="frame"
    class="frame"
    :class="{ custom: layout.margin.value !== undefined }"
    :style="frameStyle"
  >
    <template v-if="editing">
      <EdgeHandle
        v-for="side in ['left', 'right'] as const"
        :key="side"
        :side="side"
        @start="startEdge"
        @move="onEdgeMove(side, $event)"
        @reset="layout.setMargin(undefined)"
      />
    </template>
    <div ref="grid" class="grid">
      <template v-for="(column, index) in layout.columns.value" :key="column.id">
        <ColumnResizer
          v-if="editing && index > 0"
          @start="takeSnapshot"
          @move="onResizeMove(index - 1, $event)"
        />
        <ColumnView
          :column="column"
          :removable="layout.columns.value.length > 1"
          @add-block="pickerColumnId = column.id"
        />
      </template>
    </div>
    <BlockPicker :open="pickerColumnId !== null" @pick="onPick" @close="pickerColumnId = null" />
  </div>
</template>

<style scoped>
.frame {
  position: relative;
  box-sizing: border-box;
  width: min(90rem, 96vw);
  margin: 0 auto;
  padding: 0 0.75rem;
}

.frame.custom {
  width: auto;
}

.grid {
  display: flex;
  gap: 1rem;
}

@media (max-width: 720px) {
  .grid {
    flex-direction: column;
  }
}
</style>
