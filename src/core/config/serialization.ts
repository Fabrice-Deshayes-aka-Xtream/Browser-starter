import { appConfigSchema, type AppConfig } from './schema'
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

export function serializeConfig(config: AppConfig): string {
  return JSON.stringify(config, null, 2)
}
