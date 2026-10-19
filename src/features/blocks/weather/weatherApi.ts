import type {WeatherBlockConfig} from '@/core/config/schema'
import {weatherKey} from '@/core/storage/cacheKeys'
import {getStorageAdapter} from '@/core/storage/storageAdapter'
import {conditionFromCode, type WeatherCondition} from './weatherCodes'

type City = NonNullable<WeatherBlockConfig['city']>

export interface WeatherData {
  current: { temperature: number; condition: WeatherCondition; humidity: number; wind: number }
  days: Array<{ date: string; condition: WeatherCondition; min: number; max: number }>
  /** Next 15-minute slots (city local time, `YYYY-MM-DDTHH:mm`) with precipitation in mm. */
  rain?: Array<{ time: string; precipitation: number }>
  /** Today's sunrise and sunset (city local time, `YYYY-MM-DDTHH:mm`) and date (`YYYY-MM-DD`). */
  sun?: { date: string; sunrise: string; sunset: string }
}

export const RAIN_SLOTS = 4

export interface WeatherOptions {
  rain?: boolean
  sun?: boolean
}

export interface CachedWeather {
  /** Timestamp (ms) of the successful fetch. */
  time: number
  data: WeatherData
}

interface ForecastResponse {
  current: {
    time?: string
    temperature_2m: number
    weather_code: number
    relative_humidity_2m: number
    wind_speed_10m: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise?: string[]
    sunset?: string[]
  }
  minutely_15?: {
    time: string[]
    precipitation: Array<number | null>
  }
}

interface GeocodingResponse {
  results?: Array<{
    name: string
    country?: string
    admin1?: string
    latitude: number
    longitude: number
  }>
}

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

async function getJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json() as Promise<T>
}

export async function searchCities(query: string, language: string): Promise<City[]> {
  const url = new URL(GEOCODING_URL)
  url.search = new URLSearchParams({ name: query, count: '6', language }).toString()
  const data = await getJson<GeocodingResponse>(url)
  return (data.results ?? []).map((r) => ({
    name: r.admin1 && r.admin1 !== r.name ? `${r.name} (${r.admin1})` : r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }))
}

function parseRain(data: ForecastResponse): WeatherData['rain'] {
  const minutely = data.minutely_15
  if (!minutely || !data.current.time) return undefined
  // Slots are labeled by their start: keep the one containing "now" and the following ones.
  const now = data.current.time
  const slotStart = `${now.slice(0, 14)}${String(Math.floor(Number(now.slice(14, 16)) / 15) * 15).padStart(2, '0')}`
  const first = minutely.time.findIndex((time) => time >= slotStart)
  if (first < 0) return undefined
  return minutely.time.slice(first, first + RAIN_SLOTS).map((time, i) => ({
    time,
    precipitation: minutely.precipitation[first + i] ?? 0,
  }))
}

function parseSun(data: ForecastResponse): WeatherData['sun'] {
  const sunrise = data.daily.sunrise?.[0]
  const sunset = data.daily.sunset?.[0]
  const date = data.daily.time[0]
  return sunrise && sunset && date ? {date, sunrise, sunset} : undefined
}

export function parseForecast(data: ForecastResponse): WeatherData {
  const rain = parseRain(data)
  const sun = parseSun(data)
  return {
    current: {
      temperature: data.current.temperature_2m,
      condition: conditionFromCode(data.current.weather_code),
      humidity: data.current.relative_humidity_2m,
      wind: data.current.wind_speed_10m,
    },
    days: data.daily.time.map((date, i) => ({
      date,
      condition: conditionFromCode(data.daily.weather_code[i]!),
      min: data.daily.temperature_2m_min[i]!,
      max: data.daily.temperature_2m_max[i]!,
    })),
    ...(rain && {rain}),
    ...(sun && {sun}),
  }
}

const cacheKey = weatherKey

/** Last successfully fetched forecast, kept across browser restarts for offline use. */
export async function readCachedWeather(
  city: City,
  forecastDays: number,
  unit: WeatherBlockConfig['unit'],
): Promise<CachedWeather | undefined> {
  try {
    const raw = await getStorageAdapter().get(cacheKey(city, forecastDays, unit))
    const cached = raw ? (JSON.parse(raw) as Partial<CachedWeather>) : undefined
    return cached?.data && cached.time ? (cached as CachedWeather) : undefined
  } catch {
    return undefined
  }
}

async function writeCachedWeather(
  city: City,
  forecastDays: number,
  unit: WeatherBlockConfig['unit'],
  cached: CachedWeather,
): Promise<void> {
  try {
    await getStorageAdapter().set(cacheKey(city, forecastDays, unit), JSON.stringify(cached))
  } catch {
    // Caching is best-effort.
  }
}

export async function fetchWeather(
  city: City,
  forecastDays: number,
  unit: WeatherBlockConfig['unit'],
  options: WeatherOptions = {},
): Promise<CachedWeather> {
  const url = new URL(FORECAST_URL)
  const params: Record<string, string> = {
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m',
    daily: `weather_code,temperature_2m_max,temperature_2m_min${options.sun ? ',sunrise,sunset' : ''}`,
    forecast_days: String(forecastDays + 1),
    temperature_unit: unit,
    timezone: 'auto',
  }
  if (options.rain) {
    params.minutely_15 = 'precipitation'
    params.forecast_minutely_15 = '96'
  }
  url.search = new URLSearchParams(params).toString()
  const data = parseForecast(await getJson<ForecastResponse>(url))
  // The first daily entry is today: forecasts start tomorrow.
  const result = {time: Date.now(), data: {...data, days: data.days.slice(1)}}
  await writeCachedWeather(city, forecastDays, unit, result)
  return result
}
