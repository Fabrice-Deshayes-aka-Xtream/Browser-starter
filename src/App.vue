<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useConfigStore } from '@/core/stores/configStore'
import { i18n } from '@/shared/i18n'
import { useEngineFavicons } from '@/features/search/useEngineFavicons'
import SearchBar from '@/features/search/components/SearchBar.vue'
import EditToolbar from '@/features/layout/components/EditToolbar.vue'
import LayoutGrid from '@/features/layout/components/LayoutGrid.vue'
import AboutButton from '@/features/about/components/AboutButton.vue'
import WorkspaceSwitcher from '@/features/workspaces/components/WorkspaceSwitcher.vue'
import SettingsButton from '@/features/settings/components/SettingsButton.vue'

const store = useConfigStore()
useEngineFavicons()

onMounted(() => store.load())

watch(
  () => store.config.settings.locale,
  (locale) => {
    i18n.global.locale.value = locale
    document.documentElement.lang = locale
  },
  { immediate: true },
)

watch(
  () => store.config.settings.theme,
  (theme) => {
    if (theme === 'auto') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme
  },
  { immediate: true },
)
</script>

<template>
  <main v-if="store.loaded" class="app">
    <header class="top">
      <SearchBar />
    </header>
    <LayoutGrid />
    <EditToolbar />
    <WorkspaceSwitcher />
    <AboutButton />
    <SettingsButton />
  </main>
</template>

<style scoped>
.top {
  padding: 1.5rem 1rem 1.75rem;
}

.app {
  padding-bottom: 5rem;
}
</style>
