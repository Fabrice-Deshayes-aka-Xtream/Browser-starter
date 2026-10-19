import {afterEach, describe, expect, it, vi} from 'vitest'
import {cityAt, fetchWeather, parseForecast, readCachedWeather} from './weatherApi'
import {conditionFromCode} from './weatherCodes'

describe('weather', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('caches the last forecast for offline use', async () => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    })
    const city = {name: 'Paris', latitude: 48.8, longitude: 2.3}
    expect(await readCachedWeather(city, 'celsius')).toBeUndefined()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 10,
            weather_code: 0,
            relative_humidity_2m: 50,
            wind_speed_10m: 5
          },
          daily: {
            time: ['2026-01-01', '2026-01-02'],
            weather_code: [0, 61],
            temperature_2m_max: [12, 9],
            temperature_2m_min: [5, 4],
          },
        }),
      }),
    )
    const fresh = await fetchWeather(city, 'celsius')
    expect(await readCachedWeather(city, 'celsius')).toEqual(fresh)
    expect(fresh.time).toBeGreaterThan(0)
  })

  it('names a position, falling back to coordinates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({address: {town: 'Cabourg', country: 'France'}}),
      }),
    )
    expect(await cityAt(49.2871, -0.1215, 'fr')).toEqual({
      name: 'Cabourg',
      country: 'France',
      latitude: 49.29,
      longitude: -0.12,
    })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect((await cityAt(49.2871, -0.1215, 'fr')).name).toBe('49.29, -0.12')
  })

  it('maps WMO codes to conditions', () => {
    expect(conditionFromCode(0)).toBe('clear')
    expect(conditionFromCode(63)).toBe('rain')
    expect(conditionFromCode(75)).toBe('snow')
    expect(conditionFromCode(96)).toBe('thunder')
  })

  it('parses rain slots and sun times', () => {
    const data = parseForecast({
      current: {
        time: '2026-01-01T10:20',
        temperature_2m: 1,
        weather_code: 0,
        relative_humidity_2m: 60,
        wind_speed_10m: 1,
      },
      daily: {
        time: ['2026-01-01'],
        weather_code: [0],
        temperature_2m_max: [2],
        temperature_2m_min: [0],
        sunrise: ['2026-01-01T08:40'],
        sunset: ['2026-01-01T16:50'],
      },
      minutely_15: {
        time: ['2026-01-01T10:00', '2026-01-01T10:15', '2026-01-01T10:30', '2026-01-01T10:45', '2026-01-01T11:00', '2026-01-01T11:15'],
        precipitation: [9, 0.2, null, 1, 0.5, 3],
      },
    })
    expect(data.rain).toEqual([
      {time: '2026-01-01T10:15', precipitation: 0.2},
      {time: '2026-01-01T10:30', precipitation: 0},
      {time: '2026-01-01T10:45', precipitation: 1},
      {time: '2026-01-01T11:00', precipitation: 0.5},
    ])
    expect(data.sun).toEqual({
      date: '2026-01-01',
      sunrise: '2026-01-01T08:40',
      sunset: '2026-01-01T16:50'
    })
  })

  it('parses an Open-Meteo forecast response', () => {
    const data = parseForecast({
      current: {
        temperature_2m: 18.4,
        apparent_temperature: 16.2,
        weather_code: 2,
        relative_humidity_2m: 60,
        wind_speed_10m: 12,
        wind_direction_10m: 225,
      },
      daily: {
        time: ['2026-01-01', '2026-01-02'],
        weather_code: [0, 61],
        temperature_2m_max: [20, 15],
        temperature_2m_min: [10, 8],
      },
    })
    expect(data.current).toEqual({
      temperature: 18.4,
      feelsLike: 16.2,
      condition: 'partly',
      humidity: 60,
      wind: 12,
      windDirection: 225,
    })
    expect(data.days[1]).toEqual({ date: '2026-01-02', condition: 'rain', min: 8, max: 15 })
  })
})
