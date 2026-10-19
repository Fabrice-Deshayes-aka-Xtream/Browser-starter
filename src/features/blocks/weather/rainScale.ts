/** Precipitation (mm per 15 min) at which the color scale saturates (~8 mm/h, heavy rain). */
export const RAIN_MAX_MM = 2
const MIN_VISIBLE_MM = 0.05

export type RainLevel = 'none' | 'light' | 'moderate' | 'heavy'

export function rainLevel(mm: number): RainLevel {
  if (mm < MIN_VISIBLE_MM) return 'none'
  if (mm < 0.5) return 'light'
  if (mm < 1.25) return 'moderate'
  return 'heavy'
}

/** Color of a grid cell, or undefined when no rain is expected. */
export function rainColor(mm: number): string | undefined {
  if (mm < MIN_VISIBLE_MM) return undefined
  const ratio = Math.min(mm / RAIN_MAX_MM, 1)
  const hue = Math.round(200 + 80 * ratio)
  const lightness = Math.round(75 - 35 * ratio)
  return `hsl(${hue} 85% ${lightness}%)`
}

/** CSS gradient matching `rainColor`, used for the legend. */
export function rainGradient(): string {
  const stops = [0.05, 0.5, 1, 2].map((mm) => rainColor(mm))
  return `linear-gradient(to right, ${stops.join(', ')})`
}
