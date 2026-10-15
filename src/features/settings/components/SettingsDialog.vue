<script setup lang="ts">
import { useConfigStore } from '@/core/stores/configStore'
import BaseDialog from '@/shared/components/BaseDialog.vue'
import WorkspaceManager from '@/features/workspaces/components/WorkspaceManager.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const store = useConfigStore()
</script>

<template>
  <BaseDialog :open="open" :title="$t('settings.title')" width="36rem" @close="emit('close')">
    <div class="settings">
      <div class="prefs">
        <label>
          {{ $t('settings.theme') }}
          <select v-model="store.config.settings.theme">
            <option value="auto">{{ $t('settings.themeAuto') }}</option>
            <option value="light">{{ $t('settings.themeLight') }}</option>
            <option value="dark">{{ $t('settings.themeDark') }}</option>
          </select>
        </label>
        <label>
          {{ $t('settings.language') }}
          <select v-model="store.config.settings.locale">
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>
      </div>
      <WorkspaceManager />
    </div>
  </BaseDialog>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.prefs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
</style>
