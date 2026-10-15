import { describe, expect, it } from 'vitest'
import { backupFilename } from './fileTransfer'

describe('backupFilename', () => {
  const date = new Date(2026, 9, 5, 7, 4)

  it('formats the date as YY-MM-DD_HH-mm', () => {
    expect(backupFilename(date)).toBe('26-10-05_07-04_BrowserStarter.json')
  })

  it('appends the workspace name, replacing characters invalid in file names', () => {
    expect(backupFilename(date, 'Home')).toBe('26-10-05_07-04_BrowserStarter_Home.json')
    expect(backupFilename(date, 'a/b: c')).toBe('26-10-05_07-04_BrowserStarter_a-b-c.json')
  })
})
