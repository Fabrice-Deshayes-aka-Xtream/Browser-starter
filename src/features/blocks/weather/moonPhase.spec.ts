import {describe, expect, it} from 'vitest'
import {moonPhase} from './moonPhase'

describe('moonPhase', () => {
  it('finds the main phases', () => {
    expect(moonPhase(new Date('2000-01-06T18:14:00Z'))).toBe('new')
    expect(moonPhase(new Date('2000-01-21T04:40:00Z'))).toBe('full')
    expect(moonPhase(new Date('2024-04-08T18:21:00Z'))).toBe('new')
    expect(moonPhase(new Date('2024-04-24T00:00:00Z'))).toBe('full')
  })

  it('handles dates before the reference', () => {
    expect(moonPhase(new Date('1999-12-22T00:00:00Z'))).toBe('full')
  })
})
