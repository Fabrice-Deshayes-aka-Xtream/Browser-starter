<script setup lang="ts">
import { useDrag } from '@/shared/composables/useDrag'

defineProps<{ side: 'left' | 'right' }>()
const emit = defineEmits<{ start: []; move: [dx: number]; reset: [] }>()
const drag = useDrag({ onStart: () => emit('start'), onMove: (dx) => emit('move', dx) })
</script>

<template>
  <div
    class="edge"
    :class="side"
    role="separator"
    aria-orientation="vertical"
    @pointerdown.prevent="drag.start"
    @dblclick="emit('reset')"
  />
</template>

<style scoped>
.edge {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0.75rem;
  z-index: 2;
  cursor: col-resize;
  touch-action: none;
  border-radius: 0.4rem;
  background: var(--hover);
  opacity: 0.5;
}

.edge:hover {
  opacity: 1;
}

.left {
  left: 0;
}

.right {
  right: 0;
}
</style>
