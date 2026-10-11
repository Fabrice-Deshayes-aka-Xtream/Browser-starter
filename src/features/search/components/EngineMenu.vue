<script setup lang="ts">
import type { EngineView } from '../engines'
import EngineIcon from './EngineIcon.vue'

defineProps<{ engines: EngineView[]; currentId: string }>()
const emit = defineEmits<{ select: [id: string] }>()
</script>

<template>
  <div class="engine-menu" role="listbox" :aria-label="$t('search.chooseEngine')">
    <button
      v-for="engine in engines"
      :key="engine.id"
      type="button"
      role="option"
      class="choice"
      :aria-selected="engine.id === currentId"
      @click="emit('select', engine.id)"
    >
      <EngineIcon :engine="engine" />
      {{ engine.name }}
    </button>
  </div>
</template>

<style scoped>
.engine-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-width: 15rem;
  padding: 0.4rem;
  border-radius: 0.75rem;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 6px 24px rgb(0 0 0 / 0.25);
}

.choice {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.5rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.choice:hover,
.choice[aria-selected='true'] {
  background: var(--hover);
}
</style>
