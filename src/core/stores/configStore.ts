import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { createDefaultConfig, createDefaultWorkspace, createId } from '../config/defaults'
import {
  parseConfig,
  parseWorkspace,
  serializeConfig,
  serializeWorkspace,
} from '../config/serialization'
import type { AppConfig, Workspace } from '../config/schema'
import { getStorageAdapter } from '../storage/storageAdapter'

const STORAGE_KEY = 'browser-starter.config'
const SAVE_DEBOUNCE_MS = 300

export const useConfigStore = defineStore('config', () => {
  const config = ref<AppConfig>(createDefaultConfig())
  const loaded = ref(false)
  const workspace = computed(() =>
    config.value.workspaces.find((w) => w.id === config.value.activeWorkspaceId)!,
  )
  const storage = getStorageAdapter()
  let saveTimer: ReturnType<typeof setTimeout> | undefined

  async function load() {
    const stored = await storage.get(STORAGE_KEY)
    if (stored) {
      try {
        config.value = parseConfig(stored)
      } catch (error) {
        console.error('Stored configuration is invalid, using defaults', error)
      }
    }
    loaded.value = true
  }

  function exportWorkspaceJson(id: string = config.value.activeWorkspaceId): string {
    return serializeWorkspace(config.value.workspaces.find((w) => w.id === id)!)
  }

  function findWorkspaceByName(name: string) {
    const key = name.trim().toLowerCase()
    return config.value.workspaces.find((w) => w.name.trim().toLowerCase() === key)
  }

  /** Creates the workspace, or replaces the one with the same name (keeping its id and position). */
  function importWorkspace(imported: Workspace) {
    const existing = findWorkspaceByName(imported.name)
    if (existing) {
      const index = config.value.workspaces.indexOf(existing)
      config.value.workspaces[index] = { ...imported, id: existing.id }
      return
    }
    const idTaken = config.value.workspaces.some((w) => w.id === imported.id)
    config.value.workspaces.push({ ...imported, id: idTaken ? createId() : imported.id })
  }

  function importWorkspaceJson(
    json: string,
    confirmReplace: (name: string) => boolean,
  ): 'created' | 'replaced' | 'cancelled' {
    const imported = parseWorkspace(json)
    const exists = !!findWorkspaceByName(imported.name)
    if (exists && !confirmReplace(imported.name)) return 'cancelled'
    importWorkspace(imported)
    return exists ? 'replaced' : 'created'
  }

  function setActiveWorkspace(id: string) {
    if (config.value.workspaces.some((w) => w.id === id)) config.value.activeWorkspaceId = id
  }

  function addWorkspace(name: string) {
    const created = createDefaultWorkspace(name.trim())
    config.value.workspaces.push(created)
    return created
  }

  function renameWorkspace(id: string, name: string) {
    const target = config.value.workspaces.find((w) => w.id === id)
    if (target && name.trim()) target.name = name.trim()
  }

  function moveWorkspace(from: number, to: number) {
    const list = config.value.workspaces
    if (to < 0 || to >= list.length) return
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved!)
  }

  /** Deletes a workspace and its configuration; the last remaining one cannot be removed. */
  function removeWorkspace(id: string) {
    const list = config.value.workspaces
    if (list.length <= 1) return
    const index = list.findIndex((w) => w.id === id)
    if (index === -1) return
    list.splice(index, 1)
    if (config.value.activeWorkspaceId === id) {
      config.value.activeWorkspaceId = list[Math.min(index, list.length - 1)]!.id
    }
  }

  // Persist only after the initial load, to avoid overwriting stored data with defaults.
  watch(
    config,
    () => {
      if (!loaded.value) return
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        void storage.set(STORAGE_KEY, serializeConfig(config.value))
      }, SAVE_DEBOUNCE_MS)
    },
    { deep: true },
  )

  return {
    config,
    workspace,
    loaded,
    load,
    exportWorkspaceJson,
    findWorkspaceByName,
    importWorkspaceJson,
    setActiveWorkspace,
    addWorkspace,
    renameWorkspace,
    moveWorkspace,
    removeWorkspace,
  }
})
