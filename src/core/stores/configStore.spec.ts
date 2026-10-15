import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createDefaultWorkspace } from '../config/defaults'
import { CONFIG_VERSION } from '../config/schema'
import { ConfigImportError, serializeConfig } from '../config/serialization'
import { useConfigStore } from './configStore'

function createMemoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  }
}

describe('configStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    setActivePinia(createPinia())
  })

  it('persists changes after the initial load', async () => {
    vi.useFakeTimers()
    const store = useConfigStore()
    await store.load()
    store.config.settings.theme = 'dark'
    await vi.advanceTimersByTimeAsync(400)
    vi.useRealTimers()
    expect(JSON.parse(localStorage.getItem('browser-starter.config')!).settings.theme).toBe('dark')
  })

  it('restores the stored configuration on load', async () => {
    const first = useConfigStore()
    first.config.settings.theme = 'light'
    localStorage.setItem('browser-starter.config', serializeConfig(first.config))

    setActivePinia(createPinia())
    const second = useConfigStore()
    await second.load()
    expect(second.config.settings.theme).toBe('light')
  })

  it('falls back to defaults when the stored data is invalid', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    localStorage.setItem('browser-starter.config', '{broken')
    const store = useConfigStore()
    await store.load()
    expect(store.loaded).toBe(true)
    expect(store.workspace.layout.columns.length).toBeGreaterThan(0)
  })

  describe('workspaces', () => {
    it('adds, renames, reorders and activates workspaces', () => {
      const store = useConfigStore()
      const home = store.workspace.id
      const work = store.addWorkspace('  Work ')
      expect(work.name).toBe('Work')
      store.setActiveWorkspace(work.id)
      expect(store.workspace.id).toBe(work.id)
      store.renameWorkspace(work.id, 'Office')
      store.moveWorkspace(1, 0)
      expect(store.config.workspaces.map((w) => w.name)).toEqual(['Office', 'Home'])
      store.setActiveWorkspace('unknown')
      expect(store.workspace.id).toBe(work.id)
      expect(home).not.toBe(work.id)
    })

    it('removes a workspace, falls back to a neighbour and keeps the last one', () => {
      const store = useConfigStore()
      const work = store.addWorkspace('Work')
      store.setActiveWorkspace(work.id)
      store.removeWorkspace(work.id)
      expect(store.config.workspaces).toHaveLength(1)
      expect(store.workspace.name).toBe('Home')
      store.removeWorkspace(store.workspace.id)
      expect(store.config.workspaces).toHaveLength(1)
    })

    it('exports a given workspace, defaulting to the active one', () => {
      const store = useConfigStore()
      const work = store.addWorkspace('Work')
      expect(JSON.parse(store.exportWorkspaceJson()).workspace.name).toBe('Home')
      const file = JSON.parse(store.exportWorkspaceJson(work.id))
      expect(file.version).toBe(CONFIG_VERSION)
      expect(file.workspace).toEqual(work)
    })

    it('creates a workspace from a file when its name is unknown, without confirmation', () => {
      const source = useConfigStore()
      source.addWorkspace('Work')
      const json = source.exportWorkspaceJson(source.config.workspaces[1]!.id)

      setActivePinia(createPinia())
      const store = useConfigStore()
      const confirmReplace = vi.fn(() => true)
      expect(store.importWorkspaceJson(json, confirmReplace)).toBe('created')
      expect(confirmReplace).not.toHaveBeenCalled()
      expect(store.config.workspaces.map((w) => w.name)).toEqual(['Home', 'Work'])
    })

    it('gives a new id to an imported workspace whose id is already used', () => {
      const store = useConfigStore()
      const other = createDefaultWorkspace('Other')
      const json = JSON.stringify({
        version: CONFIG_VERSION,
        workspace: { ...other, id: store.workspace.id },
      })
      expect(store.importWorkspaceJson(json, () => true)).toBe('created')
      const ids = store.config.workspaces.map((w) => w.id)
      expect(new Set(ids).size).toBe(2)
    })

    it('replaces a workspace with the same name after confirmation, keeping id and position', () => {
      const store = useConfigStore()
      const home = store.workspace
      store.addWorkspace('Work')
      const imported = { ...createDefaultWorkspace('home'), id: 'from-file' }
      imported.layout.margin = 12
      const json = JSON.stringify({ version: CONFIG_VERSION, workspace: imported })

      const confirmReplace = vi.fn(() => true)
      expect(store.importWorkspaceJson(json, confirmReplace)).toBe('replaced')
      expect(confirmReplace).toHaveBeenCalledWith('home')
      expect(store.config.workspaces.map((w) => w.name)).toEqual(['home', 'Work'])
      expect(store.config.workspaces[0]!.id).toBe(home.id)
      expect(store.config.workspaces[0]!.layout.margin).toBe(12)
      expect(store.workspace.id).toBe(home.id)
    })

    it('keeps the existing workspace when the replacement is declined', () => {
      const store = useConfigStore()
      const before = JSON.stringify(store.config)
      const json = JSON.stringify({
        version: CONFIG_VERSION,
        workspace: {
          ...createDefaultWorkspace('Home'),
          layout: { columns: createDefaultWorkspace('x').layout.columns, margin: 20 },
        },
      })
      expect(store.importWorkspaceJson(json, () => false)).toBe('cancelled')
      expect(JSON.stringify(store.config)).toBe(before)
    })

    it('rejects invalid workspace files and leaves the configuration untouched', () => {
      const store = useConfigStore()
      const before = JSON.stringify(store.config)
      const bad = [
        '{nope',
        '{}',
        JSON.stringify({ version: CONFIG_VERSION, workspace: { id: 'x' } }),
        JSON.stringify({ version: 999, workspace: createDefaultWorkspace('X') }),
        serializeConfig(store.config),
      ]
      for (const json of bad) {
        expect(() => store.importWorkspaceJson(json, () => true)).toThrow(ConfigImportError)
      }
      expect(JSON.stringify(store.config)).toBe(before)
    })
  })
})
