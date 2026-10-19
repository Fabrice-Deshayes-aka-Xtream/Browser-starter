const SYNODIC_MONTH_DAYS = 29.530588853
/** A known new moon: 2000-01-06 18:14 UTC. */
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14)
const DAY_MS = 86_400_000

export const MOON_PHASES = [
  'new',
  'waxingCrescent',
  'firstQuarter',
  'waxingGibbous',
  'full',
  'waningGibbous',
  'lastQuarter',
  'waningCrescent',
] as const

export type MoonPhase = (typeof MOON_PHASES)[number]

const MOON_ICONS: Record<MoonPhase, string> = {
  new: '🌑',
  waxingCrescent: '🌒',
  firstQuarter: '🌓',
  waxingGibbous: '🌔',
  full: '🌕',
  waningGibbous: '🌖',
  lastQuarter: '🌗',
  waningCrescent: '🌘',
}

/** Position in the lunar cycle, from 0 (new moon) to 1 (next new moon). */
export function moonCycle(date: Date): number {
  const days = (date.getTime() - REFERENCE_NEW_MOON_MS) / DAY_MS
  const cycle = (days / SYNODIC_MONTH_DAYS) % 1
  return cycle < 0 ? cycle + 1 : cycle
}

export function moonPhase(date: Date): MoonPhase {
  return MOON_PHASES[Math.round(moonCycle(date) * MOON_PHASES.length) % MOON_PHASES.length]!
}

export const moonIcon = (phase: MoonPhase) => MOON_ICONS[phase]
