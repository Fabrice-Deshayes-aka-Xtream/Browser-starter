<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Block } from '@/core/config/schema'
import { getBlockDefinition } from '@/features/blocks/blockRegistry'
import BaseDialog from '@/shared/components/BaseDialog.vue'
import { useDrag } from '@/shared/composables/useDrag'
import { MIN_BLOCK_HEIGHT } from '../layoutOperations'
import { useEditMode } from '@/shared/composables/useEditMode'
import { useLayout } from '../useLayout'
import { newBlockId } from '../useNewBlock'

const props = defineProps<{ block: Block }>()

const { editing } = useEditMode()
const layout = useLayout()
const definition = getBlockDefinition(props.block.type)

// Blocks that are not resizable always fit their content, whatever height is stored.
const height = computed(() => (definition.resizable ? props.block.height : null))

const frame = ref<HTMLElement>()
const configuring = ref(false)
let startHeight = 0

onMounted(() => {
  if (newBlockId.value === props.block.id) {
    newBlockId.value = null
    configuring.value = true
  }
})
const resize = useDrag({
  onStart: () => (startHeight = frame.value?.offsetHeight ?? MIN_BLOCK_HEIGHT),
  onMove: (_dx, dy) => layout.setBlockHeight(props.block.id, startHeight + dy),
})

function save(config: Block['config']) {
  layout.updateBlockConfig(props.block.id, config)
  configuring.value = false
}
</script>

<template>
  <section
    ref="frame"
    class="block"
    :class="{ editing, fixed: height !== null }"
    :data-block-id="block.id"
    :style="{ height: height ? `${height}px` : undefined }"
  >
    <div v-if="editing" class="tools">
      <span class="block-handle" :title="$t('layout.moveBlock')">⠿</span>
      <span class="spacer" />
      <button
        v-if="definition.editor"
        type="button"
        :aria-label="$t('layout.configureBlock')"
        @click="configuring = true"
      >
        ⚙
      </button>
      <button
        type="button"
        :aria-label="$t('layout.removeBlock')"
        @click="layout.removeBlock(block.id)"
      >
        ✕
      </button>
    </div>
    <div class="body">
      <component
        :is="definition.component"
        :block="block"
        :editing="editing"
        @update-config="layout.updateBlockConfig(block.id, $event)"
      />
    </div>
    <div
      v-if="editing && definition.resizable"
      class="resize-handle"
      :title="$t('layout.resizeBlock')"
      @pointerdown.prevent="resize.start"
      @dblclick="layout.setBlockHeight(block.id, null)"
    />
    <BaseDialog
      v-if="definition.editor"
      :open="configuring"
      :title="$t(`${definition.i18nKey}.name`)"
      @close="configuring = false"
    >
      <component
        :is="definition.editor"
        :config="block.config"
        @save="save"
        @cancel="configuring = false"
      />
    </BaseDialog>
  </section>
</template>

<style scoped>
.block {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0.9rem;
  background: var(--surface);
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.15);
}

.block.editing {
  outline: 2px dashed var(--border);
}

.body {
  flex: 1;
  min-height: 0;
  padding: 0.9rem;
}

.fixed .body {
  overflow: auto;
}

.tools {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem 0;
}

.spacer {
  flex: 1;
}

.block-handle {
  cursor: grab;
  user-select: none;
}

.tools button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.resize-handle {
  height: 0.6rem;
  cursor: ns-resize;
  border-radius: 0 0 0.9rem 0.9rem;
  background: var(--hover);
  touch-action: none;
}
</style>
