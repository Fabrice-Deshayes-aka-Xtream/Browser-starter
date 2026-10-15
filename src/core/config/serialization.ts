import { z } from 'zod'
import {
  appConfigSchema,
  workspaceSchema,
  CONFIG_VERSION,
  type AppConfig,
  type Workspace,
} from './schema'
import { migrateConfig } from './migrations'

export class ConfigImportError extends Error {}

/** Parses and validates a JSON string, applying migrations when needed. */
export function parseConfig(json: string): AppConfig {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new ConfigImportError('Invalid JSON file')
  }
  try {
    return appConfigSchema.parse(migrateConfig(raw))
  } catch (error) {
    throw new ConfigImportError(error instanceof Error ? error.message : 'Invalid configuration')
  }
}

/** Parses and validates a JSON file holding a single exported workspace. */
export function parseWorkspace(json: string): Workspace {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new ConfigImportError('Invalid JSON file')
  }
  const file = z.object({ version: z.number(), workspace: z.unknown() }).safeParse(raw)
  if (!file.success) throw new ConfigImportError('Not a workspace file')
  if (file.data.version !== CONFIG_VERSION) {
    throw new ConfigImportError(`Unsupported configuration version ${file.data.version}`)
  }
  const result = workspaceSchema.safeParse(file.data.workspace)
  if (!result.success) throw new ConfigImportError(result.error.message)
  return result.data
}

export function serializeWorkspace(workspace: Workspace): string {
  return JSON.stringify({ version: CONFIG_VERSION, workspace }, null, 2)
}

export function serializeConfig(config: AppConfig): string {
  return JSON.stringify(config, null, 2)
}
