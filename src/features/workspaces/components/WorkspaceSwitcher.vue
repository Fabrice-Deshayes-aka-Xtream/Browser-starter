<script setup lang="ts">
import { useConfigStore } from '@/core/stores/configStore'

const store = useConfigStore()
</script>

<template>
  <select
    v-if="store.config.workspaces.length > 1"
    class="switcher"
    :aria-label="$t('workspaces.switch')"
    :value="store.config.activeWorkspaceId"
    @change="store.setActiveWorkspace(($event.target as HTMLSelectElement).value)"
  >
    <option v-for="workspace in store.config.workspaces" :key="workspace.id" :value="workspace.id">
      {{ workspace.name }}
    </option>
  </select>
</template>

<style scoped>
.switcher {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 5;
  height: 2.4rem;
  max-width: 12rem;
  border: 0;
  border-radius: 1.2rem;
  background-color: var(--surface);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
  cursor: pointer;
}
</style>
