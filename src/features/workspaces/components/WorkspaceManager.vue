<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfigStore } from '@/core/stores/configStore'
import { backupFilename, downloadTextFile, readTextFile } from '@/features/settings/fileTransfer'
import WorkspaceDeleteDialog from './WorkspaceDeleteDialog.vue'

const { t } = useI18n()
const store = useConfigStore()
const message = ref<{ text: string; error: boolean }>()
const workspaces = computed(() => store.config.workspaces)
const newName = ref('')
const pendingDeleteId = ref<string>()
const pendingDelete = computed(() => workspaces.value.find((w) => w.id === pendingDeleteId.value))

function add() {
  if (!newName.value.trim()) return
  store.addWorkspace(newName.value)
  newName.value = ''
}

function rename(id: string, event: Event) {
  const input = event.target as HTMLInputElement
  store.renameWorkspace(id, input.value)
  input.value = workspaces.value.find((w) => w.id === id)!.name
}

function backup(id: string) {
  const target = workspaces.value.find((w) => w.id === id)
  if (target)
    downloadTextFile(backupFilename(new Date(), target.name), store.exportWorkspaceJson(id))
}

async function importWorkspace(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const result = store.importWorkspaceJson(await readTextFile(file), (name) =>
      confirm(t('workspaces.replaceConfirm', { name })),
    )
    if (result === 'cancelled') return
    message.value = {
      text: t(result === 'created' ? 'workspaces.importCreated' : 'workspaces.importReplaced'),
      error: false,
    }
  } catch (error) {
    message.value = {
      text: `${t('settings.importError')} ${(error as Error).message}`,
      error: true,
    }
  }
}

function confirmDelete() {
  if (pendingDeleteId.value) store.removeWorkspace(pendingDeleteId.value)
  pendingDeleteId.value = undefined
}
</script>

<template>
  <section class="workspaces">
    <h3>{{ $t('workspaces.title') }}</h3>
    <p class="info">{{ $t('workspaces.storageInfo') }}</p>
    <ul>
      <li v-for="(workspace, index) in workspaces" :key="workspace.id">
        <input
          :value="workspace.name"
          :aria-label="$t('workspaces.name')"
          @change="rename(workspace.id, $event)"
        />
        <button
          type="button"
          :disabled="index === 0"
          :aria-label="$t('workspaces.moveUp')"
          @click="store.moveWorkspace(index, index - 1)"
        >
          ↑
        </button>
        <button
          type="button"
          :disabled="index === workspaces.length - 1"
          :aria-label="$t('workspaces.moveDown')"
          @click="store.moveWorkspace(index, index + 1)"
        >
          ↓
        </button>
        <button
          type="button"
          :aria-label="$t('workspaces.backup')"
          :title="$t('workspaces.backup')"
          @click="backup(workspace.id)"
        >
          ⭳
        </button>
        <button
          type="button"
          :disabled="workspaces.length <= 1"
          :aria-label="$t('workspaces.remove')"
          @click="pendingDeleteId = workspace.id"
        >
          ✕
        </button>
      </li>
    </ul>
    <form class="add" @submit.prevent="add">
      <input v-model="newName" :placeholder="$t('workspaces.namePlaceholder')" />
      <button type="submit" class="btn" :disabled="!newName.trim()">
        + {{ $t('workspaces.add') }}
      </button>
    </form>
    <div class="import">
      <label class="btn file">
        {{ $t('workspaces.import') }}
        <input type="file" accept="application/json,.json" hidden @change="importWorkspace" />
      </label>
    </div>
    <p v-if="message" role="status" :class="{ error: message.error }">{{ message.text }}</p>
    <WorkspaceDeleteDialog
      :open="!!pendingDelete"
      :name="pendingDelete?.name ?? ''"
      @close="pendingDeleteId = undefined"
      @confirm="confirmDelete"
    />
  </section>
</template>

<style scoped>
.workspaces {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--border, rgba(128, 128, 128, 0.3));
}

p {
  margin: 0;
}

.error {
  color: #d33;
}

.info {
  font-size: 0.8rem;
  opacity: 0.75;
}

.import {
  display: flex;
}

h3 {
  margin: 0;
  font-size: 0.95rem;
}

ul {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

li input {
  flex: 1;
  min-width: 0;
}

li button {
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 0.4rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

li button:hover:not(:disabled) {
  background: var(--hover);
}

li button:disabled {
  opacity: 0.3;
  cursor: default;
}

.add {
  display: flex;
  gap: 0.5rem;
}

.add input {
  flex: 1;
  min-width: 0;
}
</style>
