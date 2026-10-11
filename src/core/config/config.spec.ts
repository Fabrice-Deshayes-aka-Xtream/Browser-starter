import { describe, expect, it } from 'vitest'
import { createDefaultConfig } from './defaults'
import { migrateConfig } from './migrations'
import { ConfigImportError, parseConfig, serializeConfig } from './serialization'

describe('config serialization', () => {
  it('round-trips the default configuration', () => {
    const config = createDefaultConfig()
    expect(parseConfig(serializeConfig(config))).toEqual(config)
  })

  it('rejects malformed JSON', () => {
    expect(() => parseConfig('{nope')).toThrow(ConfigImportError)
  })

  it('rejects configurations not matching the schema', () => {
    const config = { ...createDefaultConfig(), workspaces: [] }
    expect(() => parseConfig(JSON.stringify(config))).toThrow(ConfigImportError)
  })

  it('rejects configurations from a newer version', () => {
    expect(() => migrateConfig({ version: 999 })).toThrow('Unsupported configuration version')
  })

  it('rejects an active workspace that does not exist', () => {
    const config = { ...createDefaultConfig(), activeWorkspaceId: 'ghost' }
    expect(() => parseConfig(JSON.stringify(config))).toThrow(ConfigImportError)
  })

  it('rejects configurations from an unsupported older version', () => {
    expect(() => migrateConfig({ version: 1 })).toThrow('No migration')
  })
})
