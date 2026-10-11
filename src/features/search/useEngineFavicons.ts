import { watch } from 'vue'
import { useConfigStore } from '@/core/stores/configStore'
import { fetchFavicon } from '@/features/blocks/bookmarks/favicon'

/** Session cache by site origin; `undefined` means no favicon could be loaded. */
const cache = new Map<string, Promise<string | undefined>>()

function originOf(urlTemplate: string): string | undefined {
  try {
    return new URL(urlTemplate.replace('{query}', '')).origin
  } catch {
    return undefined
  }
}

/** Fills in the favicon of every search engine (in all workspaces) that has no icon yet. */
export function useEngineFavicons() {
  const store = useConfigStore()

  const missing = () =>
    store.config.workspaces
      .flatMap((w) => w.search.engines)
      .filter((e) => !e.icon)
      .map((e) => e.id)
      .join(',')

  function sync() {
    for (const workspace of store.config.workspaces) {
      for (const engine of workspace.search.engines) {
        if (engine.icon) continue
        const origin = originOf(engine.urlTemplate)
        if (!origin) continue
        if (!cache.has(origin)) cache.set(origin, fetchFavicon(origin))
        void cache.get(origin)!.then((icon) => {
          if (icon && !engine.icon) engine.icon = icon
        })
      }
    }
  }

  watch(
    () => store.loaded && missing(),
    (state) => state !== false && sync(),
    { immediate: true },
  )
}
