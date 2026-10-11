export type WeatherCondition =
  'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'showers' | 'thunder'

const ICONS: Record<WeatherCondition, string> = {
  clear: '☀️',
  partly: '🌤️',
  cloudy: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  snow: '❄️',
  showers: '🌧️',
  thunder: '⛈️',
}

/** Maps a WMO weather interpretation code (as returned by Open-Meteo) to a condition. */
export function conditionFromCode(code: number): WeatherCondition {
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if (code >= 61 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'showers'
  if (code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'thunder'
  return 'cloudy'
}

export const conditionIcon = (condition: WeatherCondition) => ICONS[condition]
