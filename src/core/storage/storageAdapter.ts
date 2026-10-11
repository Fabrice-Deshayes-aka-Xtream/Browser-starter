export interface StorageAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
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
}

const webStorage: StorageAdapter = {
  async get(key) {
    return localStorage.getItem(key)
  },
  async set(key, value) {
    localStorage.setItem(key, value)
  },
}

/** Uses `chrome.storage.local` inside the extension, `localStorage` otherwise (dev server, tests). */
export function getStorageAdapter(): StorageAdapter {
  return hasExtensionStorage() ? extensionStorage : webStorage
}
