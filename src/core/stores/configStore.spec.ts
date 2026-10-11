import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
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
    localStorage.setItem('browser-starter.config', first.exportJson())

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

  it('replaces the configuration on import and keeps it on invalid input', () => {
    const store = useConfigStore()
    const exported = JSON.parse(store.exportJson())
    exported.settings.theme = 'dark'
    store.importJson(JSON.stringify(exported))
    expect(store.config.settings.theme).toBe('dark')

    expect(() => store.importJson('{}')).toThrow(/version/)
    expect(store.config.settings.theme).toBe('dark')
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

    it('exports and imports every workspace in one file', () => {
      const store = useConfigStore()
      store.addWorkspace('Work')
      const json = store.exportJson()
      setActivePinia(createPinia())
      const other = useConfigStore()
      other.importJson(json)
      expect(other.config.workspaces.map((w) => w.name)).toEqual(['Home', 'Work'])
    })
  })
})
