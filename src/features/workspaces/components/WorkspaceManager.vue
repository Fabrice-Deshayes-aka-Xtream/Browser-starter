<script setup lang="ts">
import { computed, ref } from 'vue'
import { useConfigStore } from '@/core/stores/configStore'
import WorkspaceDeleteDialog from './WorkspaceDeleteDialog.vue'

const store = useConfigStore()
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

function confirmDelete() {
  if (pendingDeleteId.value) store.removeWorkspace(pendingDeleteId.value)
  pendingDeleteId.value = undefined
}
</script>

<template>
  <section class="workspaces">
    <h3>{{ $t('workspaces.title') }}</h3>
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
