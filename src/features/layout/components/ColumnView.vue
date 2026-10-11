<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import type { Column } from '@/core/config/schema'
import { useEditMode } from '@/shared/composables/useEditMode'
import { useLayout } from '../useLayout'
import BlockFrame from './BlockFrame.vue'

defineProps<{ column: Column; removable: boolean }>()
const emit = defineEmits<{ addBlock: [] }>()

const { editing } = useEditMode()
const layout = useLayout()
const list = ref<HTMLElement>()
let sortable: Sortable | undefined

onMounted(() => {
  sortable = Sortable.create(list.value!, {
    group: 'blocks',
    handle: '.block-handle',
    animation: 150,
    disabled: !editing.value,
    onEnd: ({ item, from, to, oldIndex, newIndex }) => {
      // Vue owns the DOM: undo Sortable's move, then update the state and let Vue re-render.
      item.remove()
      from.insertBefore(item, from.children[oldIndex!] ?? null)
      layout.moveBlock(item.dataset.blockId!, (to as HTMLElement).dataset.columnId!, newIndex!)
    },
  })
})

watch(editing, (value) => sortable?.option('disabled', !value))
onBeforeUnmount(() => sortable?.destroy())
</script>

<template>
  <div class="column" :style="{ flex: `${column.width} 1 0` }">
    <div v-if="editing" class="column-tools">
      <span class="column-handle" :title="$t('layout.moveColumn')">⠿</span>
      <button v-if="removable" type="button" @click="layout.removeColumn(column.id)">
        {{ $t('layout.removeColumn') }}
      </button>
    </div>
    <div ref="list" class="blocks" :class="{ editing }" :data-column-id="column.id">
      <BlockFrame v-for="block in column.blocks" :key="block.id" :block="block" />
    </div>
    <button v-if="editing" type="button" class="add" @click="emit('addBlock')">
      + {{ $t('layout.addBlock') }}
    </button>
  </div>
</template>

<style scoped>
.column-tools button {
  margin-left: auto;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.blocks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.blocks.editing {
  min-height: 4rem;
}

.add,
.column-tools button {
  padding: 0.5rem;
  border: 1px dashed var(--border);
  border-radius: 0.6rem;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.column-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.column-handle {
  padding: 0 0.5rem;
  cursor: grab;
  user-select: none;
}
</style>
