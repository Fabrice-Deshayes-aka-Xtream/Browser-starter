import type { WeatherBlockConfig } from '@/core/config/schema'
import { conditionFromCode, type WeatherCondition } from './weatherCodes'

type City = NonNullable<WeatherBlockConfig['city']>

export interface WeatherData {
  current: { temperature: number; condition: WeatherCondition; humidity: number; wind: number }
  days: Array<{ date: string; condition: WeatherCondition; min: number; max: number }>
}

interface ForecastResponse {
  current: {
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

export function parseForecast(data: ForecastResponse): WeatherData {
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
  }
}

export async function fetchWeather(
  city: City,
  forecastDays: number,
  unit: WeatherBlockConfig['unit'],
): Promise<WeatherData> {
  const url = new URL(FORECAST_URL)
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: String(forecastDays + 1),
    temperature_unit: unit,
    timezone: 'auto',
  }).toString()
  const data = parseForecast(await getJson<ForecastResponse>(url))
  // The first daily entry is today: forecasts start tomorrow.
  return { ...data, days: data.days.slice(1) }
}
