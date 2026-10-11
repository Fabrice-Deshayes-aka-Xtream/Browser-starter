import { CONFIG_VERSION } from './schema'

type Migration = (config: Record<string, unknown>) => Record<string, unknown>

/** Migrations indexed by the version they upgrade FROM. */
const migrations: Record<number, Migration> = {}

/**
 * Upgrades raw stored data to the current schema version.
 * Throws when the data comes from a newer, unsupported version.
 */
export function migrateConfig(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null || !('version' in raw)) return raw
  let config = raw as Record<string, unknown>
  let version = Number(config.version)
  if (version > CONFIG_VERSION) {
    throw new Error(`Unsupported configuration version ${version}`)
  }
  while (version < CONFIG_VERSION) {
    const migrate = migrations[version]
    if (!migrate) throw new Error(`No migration from version ${version}`)
    config = migrate(config)
    version = Number(config.version)
  }
  return config
}
