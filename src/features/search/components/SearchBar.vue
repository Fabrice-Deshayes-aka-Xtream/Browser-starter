<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import BaseDialog from '@/shared/components/BaseDialog.vue'
import { useEditMode } from '@/shared/composables/useEditMode'
import { buildSearchUrl } from '../engines'
import { useSearchEngines } from '../useSearchEngines'
import EngineIcon from './EngineIcon.vue'
import EngineListEditor from './EngineListEditor.vue'
import EngineMenu from './EngineMenu.vue'

const { engines, currentEngine, selectEngine } = useSearchEngines()
const { editing } = useEditMode()

const query = ref('')
const menuOpen = ref(false)
const managing = ref(false)
const root = ref<HTMLElement>()
const input = ref<HTMLInputElement>()

onClickOutside(root, () => (menuOpen.value = false))

// The browser may focus its address bar after load (e.g. Vivaldi redirect), so retry once.
onMounted(() => {
  input.value?.focus()
  setTimeout(() => {
    if (document.activeElement === document.body) input.value?.focus()
  }, 150)
})

function onSelect(id: string) {
  selectEngine(id)
  menuOpen.value = false
}

function onSubmit() {
  if (query.value.trim() === '') return
  window.open(
    buildSearchUrl(currentEngine.value.urlTemplate, query.value),
    '_blank',
    'noopener,noreferrer',
  )
}
</script>

<template>
  <form ref="root" class="search-bar" role="search" @submit.prevent="onSubmit">
    <button
      type="button"
      class="icon-button"
      :aria-label="$t('search.chooseEngine')"
      :aria-expanded="menuOpen"
      @click="menuOpen = !menuOpen"
    >
      <EngineIcon :engine="currentEngine" />
    </button>
    <input
      ref="input"
      v-model="query"
      type="search"
      autofocus
      autocomplete="off"
      :placeholder="$t('search.placeholder')"
    />
    <button
      v-if="editing"
      type="button"
      class="icon-button"
      :aria-label="$t('search.manageEngines')"
      @click="managing = true"
    >
      ⚙
    </button>
    <button type="submit" class="icon-button" :aria-label="$t('search.submit')">🔍</button>
    <EngineMenu
      v-if="menuOpen"
      :engines="engines"
      :current-id="currentEngine.id"
      @select="onSelect"
    />
    <BaseDialog :open="managing" :title="$t('search.manageEngines')" @close="managing = false">
      <EngineListEditor />
    </BaseDialog>
  </form>
</template>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: min(42rem, 90vw);
  margin: 0 auto;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  background: var(--surface);
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.2);
}

.search-bar:focus-within {
  box-shadow:
    0 2px 10px rgb(0 0 0 / 0.2),
    0 0 0 2px var(--accent);
}

input {
  flex: 1;
  padding: 0.2rem 0;
  border: 0;
  outline: 0;
  background: transparent;
  box-shadow: none;
  color: inherit;
  font: inherit;
  font-size: 1.1rem;
}

.icon-button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
}
</style>
