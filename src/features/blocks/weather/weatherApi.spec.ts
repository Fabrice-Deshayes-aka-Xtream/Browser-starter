import { describe, expect, it } from 'vitest'
import { parseForecast } from './weatherApi'
import { conditionFromCode } from './weatherCodes'

describe('weather', () => {
  it('maps WMO codes to conditions', () => {
    expect(conditionFromCode(0)).toBe('clear')
    expect(conditionFromCode(63)).toBe('rain')
    expect(conditionFromCode(75)).toBe('snow')
    expect(conditionFromCode(96)).toBe('thunder')
  })

  it('parses an Open-Meteo forecast response', () => {
    const data = parseForecast({
      current: {
        temperature_2m: 18.4,
        weather_code: 2,
        relative_humidity_2m: 60,
        wind_speed_10m: 12,
      },
      daily: {
        time: ['2026-01-01', '2026-01-02'],
        weather_code: [0, 61],
        temperature_2m_max: [20, 15],
        temperature_2m_min: [10, 8],
      },
    })
    expect(data.current).toEqual({ temperature: 18.4, condition: 'partly', humidity: 60, wind: 12 })
    expect(data.days[1]).toEqual({ date: '2026-01-02', condition: 'rain', min: 8, max: 15 })
  })
})
