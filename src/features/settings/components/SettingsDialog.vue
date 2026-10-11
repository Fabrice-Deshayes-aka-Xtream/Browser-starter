<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '@/core/stores/configStore'
import BaseDialog from '@/shared/components/BaseDialog.vue'
import WorkspaceManager from '@/features/workspaces/components/WorkspaceManager.vue'
import { downloadTextFile, readTextFile } from '../fileTransfer'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useConfigStore()
const message = ref<{ text: string; error: boolean }>()

function exportConfig() {
  downloadTextFile('browser-starter-config.json', store.exportJson())
}

async function importConfig(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!confirm(t('settings.importConfirm'))) return
  try {
    store.importJson(await readTextFile(file))
    message.value = { text: t('settings.importSuccess'), error: false }
  } catch (error) {
    message.value = {
      text: `${t('settings.importError')} ${(error as Error).message}`,
      error: true,
    }
  }
}

function resetConfig() {
  if (confirm(t('settings.resetConfirm'))) store.reset()
}
</script>

<template>
  <BaseDialog :open="open" :title="$t('settings.title')" @close="emit('close')">
    <div class="settings">
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
      <WorkspaceManager />
      <div class="row">
        <button type="button" class="btn" @click="exportConfig">{{ $t('settings.export') }}</button>
        <label class="btn file">
          {{ $t('settings.import') }}
          <input type="file" accept="application/json,.json" hidden @change="importConfig" />
        </label>
        <button type="button" class="btn" @click="resetConfig">{{ $t('settings.reset') }}</button>
      </div>
      <p v-if="message" role="status" :class="{ error: message.error }">{{ message.text }}</p>
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

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.file {
  flex-direction: row;
  align-items: center;
}

p {
  margin: 0;
}

.error {
  color: #d33;
}
</style>
