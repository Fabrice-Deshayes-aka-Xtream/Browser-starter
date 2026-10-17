export interface StorageAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>

  remove(key: string): Promise<void>

  keys(): Promise<string[]>
}

const hasExtensionStorage = () => typeof chrome !== 'undefined' && !!chrome.storage?.local

const extensionStorage: StorageAdapter = {
  async get(key) {
    const result = await chrome.storage.local.get(key)
    return (result[key] as string | undefined) ?? null
  },
  async set(key, value) {
    await chrome.storage.local.set({ [key]: value })
  },
  async remove(key) {
    await chrome.storage.local.remove(key)
  },
  async keys() {
    return Object.keys(await chrome.storage.local.get(null))
  },
}

const webStorage: StorageAdapter = {
  async get(key) {
    return localStorage.getItem(key)
  },
  async set(key, value) {
    localStorage.setItem(key, value)
  },
  async remove(key) {
    localStorage.removeItem(key)
  },
  async keys() {
    return Array.from({length: localStorage.length}, (_, i) => localStorage.key(i)!)
  },
}

/** Uses `chrome.storage.local` inside the extension, `localStorage` otherwise (dev server, tests). */
export function getStorageAdapter(): StorageAdapter {
  return hasExtensionStorage() ? extensionStorage : webStorage
}
