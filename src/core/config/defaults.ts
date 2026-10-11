import { DEFAULT_ENGINES } from './defaultEngines'
import { CONFIG_VERSION, type AppConfig, type Workspace } from './schema'

export function createId(): string {
  return crypto.randomUUID()
}

export function createDefaultWorkspace(name: string): Workspace {
  return {
    id: createId(),
    name,
    search: { defaultEngineId: 'google', engines: DEFAULT_ENGINES.map((e) => ({ ...e })) },
    layout: {
      columns: [
        { id: createId(), width: 1, blocks: [] },
        { id: createId(), width: 1, blocks: [] },
        { id: createId(), width: 1, blocks: [] },
      ],
    },
  }
}

export function createDefaultConfig(): AppConfig {
  const home = createDefaultWorkspace('Home')
  return {
    version: CONFIG_VERSION,
    activeWorkspaceId: home.id,
    workspaces: [home],
    settings: { theme: 'auto', locale: navigator.language.startsWith('fr') ? 'fr' : 'en' },
  }
}
