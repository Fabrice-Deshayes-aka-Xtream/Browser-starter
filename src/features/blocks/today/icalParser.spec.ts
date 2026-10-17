import {describe, expect, it} from 'vitest'
import {parseIcal} from './icalParser'

const wrap = (body: string) =>
  `BEGIN:VCALENDAR\r\n${body.replace(/\n/g, '\r\n')}\r\nEND:VCALENDAR`

describe('parseIcal', () => {
  const from = Date.UTC(2026, 9, 17, 12, 0, 0)

  it('parses UTC and zoned events, sorted, skipping past ones', () => {
    const ics = wrap(`BEGIN:VEVENT
SUMMARY:Later
DTSTART:20261020T100000Z
DTEND:20261020T110000Z
END:VEVENT
BEGIN:VEVENT
SUMMARY:Paris\\, lunch
DTSTART;TZID=Europe/Paris:20261018T120000
END:VEVENT
BEGIN:VEVENT
SUMMARY:Past
DTSTART:20261001T100000Z
END:VEVENT`)
    const events = parseIcal(ics, from, 10)
    expect(events.map((e) => e.title)).toEqual(['Paris, lunch', 'Later'])
    expect(events[0]!.start).toBe(Date.UTC(2026, 9, 18, 10, 0, 0))
  })

  it('expands weekly recurrences and honors EXDATE and COUNT', () => {
    const ics = wrap(`BEGIN:VEVENT
SUMMARY:Standup
DTSTART:20261019T080000Z
RRULE:FREQ=WEEKLY;COUNT=3
EXDATE:20261026T080000Z
END:VEVENT`)
    expect(parseIcal(ics, from, 10).map((e) => e.start)).toEqual([
      Date.UTC(2026, 9, 19, 8),
      Date.UTC(2026, 10, 2, 8),
    ])
  })

  it('limits the number of events', () => {
    const ics = wrap(`BEGIN:VEVENT
SUMMARY:Daily
DTSTART:20261018T080000Z
RRULE:FREQ=DAILY
END:VEVENT`)
    expect(parseIcal(ics, from, 5)).toHaveLength(5)
  })
})
