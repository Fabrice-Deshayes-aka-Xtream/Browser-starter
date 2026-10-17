export interface CalendarEvent {
  /** Start timestamp (ms). */
  start: number
  /** End timestamp (ms); equals `start` for events without an end. */
  end: number
  allDay: boolean
  title: string
}

interface Prop {
  params: Record<string, string>
  value: string
}

const DAY_MS = 86_400_000
const MAX_OCCURRENCES = 2000
const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function unfold(text: string): string[] {
  return text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/)
}

function parseLine(line: string): [string, Prop] | null {
  // The first colon outside of a quoted parameter value separates the name from the value.
  let quoted = false
  let colon = -1
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') quoted = !quoted
    else if (line[i] === ':' && !quoted) {
      colon = i
      break
    }
  }
  if (colon < 0) return null
  const [name, ...rawParams] = line.slice(0, colon).split(';')
  const params: Record<string, string> = {}
  for (const raw of rawParams) {
    const eq = raw.indexOf('=')
    if (eq > 0) params[raw.slice(0, eq).toUpperCase()] = raw.slice(eq + 1).replace(/"/g, '')
  }
  return [name!.toUpperCase(), {params, value: line.slice(colon + 1)}]
}

function unescapeText(value: string): string {
  return value.replace(/\\([nN,;\\])/g, (_, c: string) => (c.toLowerCase() === 'n' ? ' ' : c))
}

function zoneOffset(timestamp: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(new Date(timestamp))
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value)
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  )
  return asUtc - Math.floor(timestamp / 1000) * 1000
}

/** Converts a wall-clock time expressed in `timeZone` (given as if it were UTC) to a timestamp. */
function zonedToTimestamp(wallAsUtc: number, timeZone: string): number {
  const first = wallAsUtc - zoneOffset(wallAsUtc, timeZone)
  return wallAsUtc - zoneOffset(first, timeZone)
}

function parseDate(prop: Prop): { time: number; allDay: boolean } | null {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(prop.value.trim())
  if (!match) return null
  const [, y, mo, d, h, mi, s, z] = match
  const year = Number(y)
  const month = Number(mo) - 1
  const day = Number(d)
  if (h === undefined) return {time: new Date(year, month, day).getTime(), allDay: true}
  const wall = Date.UTC(year, month, day, Number(h), Number(mi), Number(s ?? 0))
  if (z) return {time: wall, allDay: false}
  const tz = prop.params.TZID
  if (tz) {
    try {
      return {time: zonedToTimestamp(wall, tz), allDay: false}
    } catch {
      // Unknown zone name (e.g. a Windows zone name): fall back to local time.
    }
  }
  return {
    time: new Date(year, month, day, Number(h), Number(mi), Number(s ?? 0)).getTime(),
    allDay: false,
  }
}

function parseDuration(value: string): number {
  const match = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value)
  if (!match) return 0
  const [, sign, w, d, h, m, s] = match
  const ms =
    Number(w ?? 0) * 7 * DAY_MS +
    Number(d ?? 0) * DAY_MS +
    Number(h ?? 0) * 3_600_000 +
    Number(m ?? 0) * 60_000 +
    Number(s ?? 0) * 1000
  return sign === '-' ? -ms : ms
}

interface Rule {
  freq: string
  interval: number
  count?: number
  until?: number
  byDay: number[]
}

function parseRule(value: string): Rule | null {
  const map = Object.fromEntries(value.split(';').map((p) => p.split('=') as [string, string]))
  if (!map.FREQ) return null
  const until = map.UNTIL ? parseDate({params: {}, value: map.UNTIL}) : null
  return {
    freq: map.FREQ,
    interval: Math.max(1, Number(map.INTERVAL ?? 1) || 1),
    count: map.COUNT ? Number(map.COUNT) : undefined,
    // A date-only UNTIL is inclusive of the whole day.
    until: until ? (until.allDay ? until.time + DAY_MS - 1 : until.time) : undefined,
    byDay: (map.BYDAY ?? '')
      .split(',')
      .map((d) => WEEKDAYS.indexOf(d.slice(-2)))
      .filter((d) => d >= 0),
  }
}

/** Generates the start timestamps of a recurring event up to `horizon` (supports DAILY, WEEKLY, MONTHLY, YEARLY). */
function* occurrences(start: number, rule: Rule, horizon: number): Generator<number> {
  const first = new Date(start)
  let emitted = 0
  for (let step = 0; step < MAX_OCCURRENCES; step++) {
    const candidates: number[] = []
    const n = step * rule.interval
    if (rule.freq === 'DAILY') {
      candidates.push(start + n * DAY_MS)
    } else if (rule.freq === 'WEEKLY') {
      const days = rule.byDay.length ? rule.byDay : [first.getDay()]
      for (const wd of [...days].sort((a, b) => a - b)) {
        candidates.push(start + (n * 7 + wd - first.getDay()) * DAY_MS)
      }
    } else if (rule.freq === 'MONTHLY') {
      const d = new Date(start)
      d.setMonth(first.getMonth() + n)
      // Months too short for the day are skipped, as per RFC 5545.
      if (d.getDate() === first.getDate()) candidates.push(d.getTime())
    } else if (rule.freq === 'YEARLY') {
      const d = new Date(start)
      d.setFullYear(first.getFullYear() + n)
      if (d.getDate() === first.getDate()) candidates.push(d.getTime())
    } else {
      return
    }
    for (const candidate of candidates) {
      if (candidate < start) continue
      if (candidate > horizon || (rule.until !== undefined && candidate > rule.until)) return
      yield candidate
      emitted++
      if (rule.count !== undefined && emitted >= rule.count) return
    }
  }
}

function expandEvent(
  props: Record<string, Prop[]>,
  from: number,
  horizon: number,
): CalendarEvent[] {
  if (props.STATUS?.[0]?.value.toUpperCase() === 'CANCELLED') return []
  const dtstart = props.DTSTART?.[0] && parseDate(props.DTSTART[0])
  if (!dtstart) return []
  const dtend = props.DTEND?.[0] && parseDate(props.DTEND[0])
  const duration = props.DURATION?.[0] ? parseDuration(props.DURATION[0].value) : null
  const length = dtend
    ? Math.max(0, dtend.time - dtstart.time)
    : (duration ?? (dtstart.allDay ? DAY_MS : 0))
  const title = unescapeText(props.SUMMARY?.[0]?.value ?? '').trim()
  const make = (start: number): CalendarEvent => ({
    start,
    end: start + length,
    allDay: dtstart.allDay,
    title,
  })
  // Events in progress are kept.
  const keep = (e: CalendarEvent) => e.end >= from

  const rule = props.RRULE?.[0] ? parseRule(props.RRULE[0].value) : null
  if (!rule) return [make(dtstart.time)].filter(keep)

  const excluded = new Set(
    (props.EXDATE ?? [])
      .flatMap((p) => p.value.split(',').map((value) => parseDate({params: p.params, value})))
      .filter((d) => d !== null)
      .map((d) => d.time),
  )
  const result: CalendarEvent[] = []
  for (const start of occurrences(dtstart.time, rule, horizon)) {
    if (excluded.has(start)) continue
    const event = make(start)
    if (keep(event)) result.push(event)
  }
  return result
}

/** Parses an iCal document and returns the first `limit` events not yet finished at `from`, expanding simple recurrences. */
export function parseIcal(text: string, from: number, limit: number): CalendarEvent[] {
  const horizon = from + 366 * DAY_MS
  const events: CalendarEvent[] = []
  let current: Record<string, Prop[]> | null = null

  for (const line of unfold(text)) {
    const upper = line.toUpperCase()
    if (upper === 'BEGIN:VEVENT') {
      current = {}
    } else if (upper === 'END:VEVENT') {
      if (current) events.push(...expandEvent(current, from, horizon))
      current = null
    } else if (current) {
      const parsed = parseLine(line)
      if (parsed) (current[parsed[0]] ??= []).push(parsed[1])
    }
  }

  return events.sort((a, b) => a.start - b.start).slice(0, limit)
}
