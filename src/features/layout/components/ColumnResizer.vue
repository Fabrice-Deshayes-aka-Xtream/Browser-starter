<script setup lang="ts">
import { useDrag } from '@/shared/composables/useDrag'

const emit = defineEmits<{ start: []; move: [dx: number] }>()
const drag = useDrag({ onStart: () => emit('start'), onMove: (dx) => emit('move', dx) })
</script>

<template>
  <div
    class="resizer"
    role="separator"
    aria-orientation="vertical"
    @pointerdown.prevent="drag.start"
  />
</template>

<style scoped>
.resizer {
  flex: 0 0 0.75rem;
  margin: 0 -0.375rem;
  z-index: 1;
  cursor: col-resize;
  touch-action: none;
  border-radius: 0.4rem;
}

.resizer:hover {
  background: var(--hover);
}
</style>
