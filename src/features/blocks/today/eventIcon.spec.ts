import {describe, expect, it} from 'vitest'
import {DEFAULT_EVENT_ICON, eventIcon} from './eventIcon'

describe('eventIcon', () => {
  it('matches French and English keywords', () => {
    expect(eventIcon('Anniversaire Arnaud')).toBe('🎂')
    expect(eventIcon("Bob's Birthday")).toBe('🎂')
    expect(eventIcon('RDV Médecin')).toBe('🏥')
    expect(eventIcon('Doctor appointment')).toBe('🏥')
    expect(eventIcon('Fête Lise')).toBe('🥂')
  })

  it('falls back to the default icon', () => {
    expect(eventIcon('Xyzzy')).toBe(DEFAULT_EVENT_ICON)
  })
})
