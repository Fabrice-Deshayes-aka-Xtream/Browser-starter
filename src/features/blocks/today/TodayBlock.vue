<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {Block} from '@/core/config/schema'
import {readStoredJson, writeStoredJson} from '@/core/storage/jsonCache'
import {todayKey} from '@/core/storage/cacheKeys'
import {type CalendarEvent, parseIcal} from './icalParser'

const props = defineProps<{ block: Extract<Block, { type: 'today' }> }>()

const CLOCK_MS = 15_000
const REFRESH_MS = 15 * 60 * 1000
const {t, locale} = useI18n()

const now = ref(Date.now())
const clockTimer = setInterval(() => (now.value = Date.now()), CLOCK_MS)

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const dateLabel = computed(() =>
  capitalize(
    new Intl.DateTimeFormat(locale.value, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(now.value),
  ),
)

const timeFormat = (timeZone?: string) => {
  try {
    return new Intl.DateTimeFormat(locale.value, {hour: '2-digit', minute: '2-digit', timeZone})
  } catch {
    return null
  }
}

const localTime = computed(() => timeFormat()!.format(now.value))

const clocks = computed(() =>
  props.block.config.timezones.flatMap((zone) => {
    const format = timeFormat(zone)
    if (!format) return []
    return [{
      zone,
      label: zone.split('/').pop()!.replace(/_/g, ' '),
      time: format.format(now.value)
    }]
  }),
)

const events = ref<CalendarEvent[]>([])
const loading = ref(false)
const failedCount = ref(0)

const cacheKey = todayKey
const MAX_EVENTS = 50 // Matches the schema maximum of `eventCount`.

const calendarUrl = (url: string) => url.trim().replace(/^webcal:/i, 'https:')
const upcoming = (lists: CalendarEvent[][], count: number) =>
  lists
    .flat()
    .filter((e) => e.end > Date.now())
    .sort((a, b) => a.start - b.start)
    .slice(0, count)

async function loadCalendar(url: string): Promise<CalendarEvent[] | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const all = parseIcal(await response.text(), Date.now(), MAX_EVENTS)
    await writeStoredJson(cacheKey(url), all)
    return all
  } catch {
    return null
  }
}

let refreshId = 0

async function refresh() {
  const id = ++refreshId
  const {showEvents, calendars, eventCount} = props.block.config
  const urls = [...new Set(calendars.map((c) => calendarUrl(c.url)).filter(Boolean))]
  if (!showEvents || !urls.length) {
    events.value = []
    failedCount.value = 0
    return
  }
  loading.value = true
  if (!events.value.length) {
    // Show the last stored events instantly, dropping those that finished since.
    const stored = await Promise.all(
      urls.map(async (url) => (await readStoredJson<CalendarEvent[]>(cacheKey(url))) ?? []),
    )
    if (id !== refreshId) return
    events.value = upcoming(stored, eventCount)
  }
  const results = await Promise.all(urls.map(loadCalendar))
  if (id !== refreshId) return
  const loaded = results.filter((r): r is CalendarEvent[] => r !== null)
  if (loaded.length) {
    // Calendars that failed keep their stored events when offline.
    const fallback = await Promise.all(
      urls.map(async (url, i) =>
        results[i] ?? (await readStoredJson<CalendarEvent[]>(cacheKey(url))) ?? [],
      ),
    )
    if (id !== refreshId) return
    events.value = upcoming(fallback, eventCount)
  }
  failedCount.value = results.length - loaded.length
  loading.value = false
}

watch(
  () => [
    props.block.config.showEvents,
    props.block.config.calendars.map((c) => c.url).join('\n'),
    props.block.config.eventCount,
  ],
  refresh,
  {immediate: true},
)
const refreshTimer = setInterval(refresh, REFRESH_MS)

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
})

function eventDay(event: CalendarEvent): string {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(event.start)
}

function eventTime(event: CalendarEvent): string {
  return event.allDay ? t('today.allDay') : timeFormat()!.format(event.start)
}
</script>

<template>
  <div class="today">
    <p v-if="block.config.showDate" class="date">{{ dateLabel }}</p>
    <div v-if="block.config.showTime" class="clocks">
      <div class="clock main">
        <span class="time">{{ localTime }}</span>
      </div>
      <div v-for="clock in clocks" :key="clock.zone" class="clock">
        <span class="time">{{ clock.time }}</span>
        <span class="label">{{ clock.label }}</span>
      </div>
    </div>
    <div v-if="block.config.showEvents" class="events">
      <p v-if="!block.config.calendars.length" class="hint">{{ t('today.noUrl') }}</p>
      <p v-else-if="loading && !events.length" class="hint">{{ t('today.loading') }}</p>
      <p v-else-if="failedCount && !events.length" class="hint">{{ t('today.error') }}</p>
      <p v-else-if="!events.length" class="hint">{{ t('today.noEvents') }}</p>
      <ul v-else>
        <li v-for="(event, index) in events" :key="`${event.start}-${index}`">
          <span class="when">{{ eventDay(event) }} · {{ eventTime(event) }}</span>
          <span class="title">{{ event.title }}</span>
        </li>
      </ul>
      <p v-if="failedCount && events.length" class="hint">
        {{ t('today.failed', {count: failedCount}) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.today {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.date {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.clocks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.clock {
  display: flex;
  flex-direction: column;
}

.time {
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
}

.main .time {
  font-size: 2rem;
  font-weight: 300;
  line-height: 1.1;
}

.label,
.when,
.hint {
  font-size: 0.78rem;
  opacity: 0.65;
}

.hint {
  margin: 0;
}

.events ul {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.events li {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.events .title {
  font-size: 0.92rem;
  overflow-wrap: anywhere;
}
</style>
