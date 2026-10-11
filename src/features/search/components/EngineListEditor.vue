<script setup lang="ts">
import { ref } from 'vue'
import { useSortableList } from '@/shared/composables/useSortableList'
import { useSearchEngines } from '../useSearchEngines'
import CustomEngineForm from './CustomEngineForm.vue'
import EngineIcon from './EngineIcon.vue'

const { engines, addEngine, removeEngine, reorderEngines, restoreDefaultEngines } =
  useSearchEngines()

const list = ref<HTMLElement>()
const adding = ref(false)

useSortableList(list, { handle: '.row', enabled: ref(true), onReorder: reorderEngines })

function onAdd(name: string, urlTemplate: string) {
  addEngine(name, urlTemplate)
  adding.value = false
}
</script>

<template>
  <div class="editor">
    <ul ref="list" class="engines">
      <li v-for="engine in engines" :key="engine.id" class="row">
        <EngineIcon :engine="engine" />
        <span class="name">{{ engine.name }}</span>
        <button
          type="button"
          :disabled="engines.length <= 1"
          :aria-label="$t('search.remove')"
          @click="removeEngine(engine.id)"
        >
          ✕
        </button>
      </li>
    </ul>
    <CustomEngineForm v-if="adding" @submit="onAdd" @cancel="adding = false" />
    <div v-else class="actions">
      <button type="button" class="btn" @click="adding = true">
        + {{ $t('search.addEngine') }}
      </button>
      <button type="button" class="btn" @click="restoreDefaultEngines">
        {{ $t('search.restoreDefaults') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.engines {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0.4rem;
  border-radius: 0.5rem;
  cursor: grab;
}

.row:hover {
  background: var(--hover);
}

.name {
  flex: 1;
}

.row button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
