import { computed } from 'vue'
import { useConfigStore } from '@/core/stores/configStore'
import { createId } from '@/core/config/defaults'
import { DEFAULT_ENGINES } from '@/core/config/defaultEngines'
import { toEngineView, type EngineView } from './engines'

export function useSearchEngines() {
  const store = useConfigStore()
  const search = computed(() => store.workspace.search)

  const engines = computed<EngineView[]>(() => search.value.engines.map(toEngineView))
  const currentEngine = computed(
    () => engines.value.find((e) => e.id === search.value.defaultEngineId) ?? engines.value[0]!,
  )

  function selectEngine(id: string) {
    search.value.defaultEngineId = id
  }

  function addEngine(name: string, urlTemplate: string) {
    search.value.engines.push({ id: createId(), name, urlTemplate })
  }

  /** The last remaining engine cannot be removed. */
  function removeEngine(id: string) {
    if (search.value.engines.length <= 1) return
    search.value.engines = search.value.engines.filter((e) => e.id !== id)
    if (search.value.defaultEngineId === id)
      search.value.defaultEngineId = search.value.engines[0]!.id
  }

  function reorderEngines(from: number, to: number) {
    const next = [...search.value.engines]
    next.splice(to, 0, next.splice(from, 1)[0]!)
    search.value.engines = next
  }

  function restoreDefaultEngines() {
    const present = new Set(search.value.engines.map((e) => e.id))
    search.value.engines.push(...DEFAULT_ENGINES.filter((e) => !present.has(e.id)))
  }

  return {
    engines,
    currentEngine,
    selectEngine,
    addEngine,
    removeEngine,
    reorderEngines,
    restoreDefaultEngines,
  }
}
