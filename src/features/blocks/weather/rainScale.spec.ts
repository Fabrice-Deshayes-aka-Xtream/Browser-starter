import {describe, expect, it} from 'vitest'
import {rainColor, rainLevel} from './rainScale'

describe('rainScale', () => {
  it('leaves dry slots uncolored', () => {
    expect(rainColor(0)).toBeUndefined()
    expect(rainLevel(0)).toBe('none')
  })

  it('colors rain and saturates', () => {
    expect(rainColor(0.3)).toBeDefined()
    expect(rainColor(5)).toBe(rainColor(2))
    expect(rainColor(0.3)).not.toBe(rainColor(1.5))
  })

  it('classifies intensity', () => {
    expect(rainLevel(0.2)).toBe('light')
    expect(rainLevel(0.8)).toBe('moderate')
    expect(rainLevel(3)).toBe('heavy')
  })
})
