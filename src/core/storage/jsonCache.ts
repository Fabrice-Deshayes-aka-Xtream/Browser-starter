import {getStorageAdapter} from './storageAdapter'

/** Best-effort JSON persistence (survives browser restarts); failures are silently ignored. */
export async function readStoredJson<T>(key: string): Promise<T | undefined> {
  try {
    const raw = await getStorageAdapter().get(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

export async function writeStoredJson(key: string, value: unknown): Promise<void> {
  try {
    await getStorageAdapter().set(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage unavailable: caching is optional.
  }
}
