<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {Block, WeatherBlockConfig} from '@/core/config/schema'
import {
  type CachedWeather,
  fetchWeather,
  locateCity,
  readCachedWeather,
  readLocatedCity,
  type WeatherData,
  writeLocatedCity,
} from './weatherApi'
import {conditionIcon} from './weatherCodes'
import {moonPhase} from './moonPhase'
import {rainColor, rainGradient, rainLevel} from './rainScale'

const props = defineProps<{ block: Extract<Block, { type: 'weather' }> }>()

const {t, tm, rt, locale} = useI18n()

const root = ref<HTMLElement>()
const width = ref(0)
const displayCity = ref<NonNullable<WeatherBlockConfig['city']>>()
const data = ref<WeatherData>()
const updatedAt = ref<number>()
const error = ref(false)
const loading = ref(false)

const unitSymbol = computed(() => (props.block.config.unit === 'celsius' ? '°C' : '°F'))
const weekday = computed(() => new Intl.DateTimeFormat(locale.value, { weekday: 'short' }))
const round = (value: number) => Math.round(value)
const updatedLabel = computed(() =>
  updatedAt.value === undefined
    ? ''
    : new Intl.DateTimeFormat(locale.value, {dateStyle: 'short', timeStyle: 'short'}).format(
      updatedAt.value,
    ),
)

// Minimum width of one forecast day (2.6rem) plus the gap between days (0.2rem), in px.
const DAY_WIDTH = 41.6
const DAY_GAP = 3.2
const visibleDays = computed(() => {
  const fit = Math.max(1, Math.floor((width.value + DAY_GAP) / (DAY_WIDTH + DAY_GAP)))
  return data.value?.days.slice(0, width.value ? fit : undefined) ?? []
})

const legendGradient = rainGradient()
const rainSlots = computed(() =>
  props.block.config.showRainHour && data.value?.rain ? data.value.rain : undefined,
)
const hasRain = computed(() => rainSlots.value?.some((slot) => rainLevel(slot.precipitation) !== 'none'))
// French writes times as 08h27.
const windFrom = (degrees: number) => {
  const index = Math.round(degrees / 45) % 8
  return tm('weather.windDirections')[index] ? rt(tm('weather.windDirections')[index]!) : ''
}
const sunTime = (time: string) => {
  const hhmm = time.slice(11, 16)
  if (locale.value.startsWith('fr')) return hhmm.replace(':', 'h')
  // The time is already in the city's time zone: format it as a plain clock time (e.g. 8:29 AM).
  const [hours = 0, minutes = 0] = hhmm.split(':').map(Number)
  return new Intl.DateTimeFormat(locale.value, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(Date.UTC(1970, 0, 1, hours, minutes))
}
const sun = computed(() => {
  const value = props.block.config.showSunMoon ? data.value?.sun : undefined
  if (!value) return undefined
  const phase = moonPhase(new Date(`${value.date}T12:00:00Z`))
  return {sunrise: sunTime(value.sunrise), sunset: sunTime(value.sunset), phase}
})
const slotTitle = (time: string, mm: number) =>
  `${time.slice(11, 16)} · ${t(`weather.rain${rainLevel(mm).replace(/^./, (c) => c.toUpperCase())}`)} (${mm.toFixed(1)} mm)`

function apply(entry: CachedWeather) {
  data.value = entry.data
  updatedAt.value = entry.time
}

// Following the user's position: the last known place (or the fallback city) is used until it is found.
async function resolveCity(): Promise<typeof displayCity.value> {
  const {city, useLocation} = props.block.config
  if (!useLocation) return city ?? undefined
  try {
    const located = await locateCity(locale.value)
    await writeLocatedCity(located)
    return located
  } catch {
    return (await readLocatedCity()) ?? city ?? undefined
  }
}

async function refresh() {
  const {city, unit, showRainHour, showSunMoon, useLocation} = props.block.config
  loading.value = true
  try {
    if (!data.value) {
      displayCity.value = (useLocation ? await readLocatedCity() : undefined) ?? city ?? undefined
      const cached = displayCity.value && (await readCachedWeather(displayCity.value, unit))
      if (cached) apply(cached)
    }
    const target = await resolveCity()
    displayCity.value = target
    if (!target) {
      error.value = true
      return
    }
    apply(await fetchWeather(target, unit, {rain: showRainHour, sun: showSunMoon}))
    error.value = false
  } catch {
    // Keep showing the cached forecast when offline.
    error.value = !data.value
  } finally {
    loading.value = false
  }
}

watch(
  () => props.block.config,
  () => {
    data.value = undefined
    updatedAt.value = undefined
    error.value = false
    void refresh()
  },
  { immediate: true, deep: true },
)

let timer: ReturnType<typeof setInterval> | undefined
watch(
  () => props.block.config.refreshMinutes,
  (minutes) => {
    clearInterval(timer)
    timer = setInterval(refresh, minutes * 60 * 1000)
  },
  {immediate: true},
)
let observer: ResizeObserver | undefined
onMounted(() => {
  if (!root.value) return
  width.value = root.value.clientWidth
  observer = new ResizeObserver((entries) => {
    width.value = entries[0]?.contentRect.width ?? width.value
  })
  observer.observe(root.value)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  observer?.disconnect()
})
</script>

<template>
  <div ref="root" class="weather">
    <p v-if="!displayCity && !error && !(block.config.useLocation && loading)" class="hint">
      {{ t('weather.noCity') }}</p>
    <p v-else-if="!displayCity && block.config.useLocation && loading" class="hint">
      {{ t('weather.loading') }}</p>
    <p v-else-if="!displayCity" class="hint">{{ t('weather.locationError') }}</p>
    <template v-else>
      <h3 class="city">{{ displayCity.name }}</h3>
      <p v-if="error" class="hint">{{ t('weather.error') }}</p>
      <p v-else-if="loading && !data" class="hint">{{ t('weather.loading') }}</p>
      <template v-if="data">
        <div class="current">
          <span class="icon">{{ conditionIcon(data.current.condition) }}</span>
          <div>
            <div class="temp">
              {{ round(data.current.temperature) }}{{ unitSymbol }}
              <span v-if="data.current.feelsLike !== undefined" class="feels-like">{{
                  t('weather.feelsLike', {value: round(data.current.feelsLike)})
                }}</span>
            </div>
            <div class="details">
              {{ t(`weather.conditions.${data.current.condition}`) }} ·
              {{ t('weather.humidity', {value: data.current.humidity}) }}
              <br/>
              {{
                data.current.windDirection === undefined
                  ? t('weather.wind', {value: round(data.current.wind)})
                  : t('weather.windFrom', {
                    value: round(data.current.wind),
                    direction: windFrom(data.current.windDirection),
                  })
              }}
            </div>
          </div>
        </div>
        <ul class="days">
          <li v-for="day in visibleDays" :key="day.date">
            <span class="day">{{ weekday.format(new Date(day.date)) }}</span>
            <span class="icon">{{ conditionIcon(day.condition) }}</span>
            <span>{{ round(day.max) }}°</span>
            <span class="min">{{ round(day.min) }}°</span>
          </li>
        </ul>
        <section v-if="rainSlots?.length" class="rain">
          <h4>{{ t('weather.rainTitle') }}</h4>
          <ul class="slots">
            <li v-for="slot in rainSlots" :key="slot.time">
              <span
                class="cell"
                :style="{ background: rainColor(slot.precipitation) }"
                :title="slotTitle(slot.time, slot.precipitation)"
              ></span>
              <span class="slot-time">{{ slot.time.slice(11, 16) }}</span>
            </li>
          </ul>
          <p v-if="!hasRain" class="hint">{{ t('weather.noRain') }}</p>
          <div class="legend">
            <span>{{ t('weather.rainLight') }}</span>
            <span class="scale" :style="{ background: legendGradient }"></span>
            <span>{{ t('weather.rainHeavy') }}</span>
          </div>
        </section>
        <section v-if="sun" class="sun">
          <p>{{ t('weather.sunSentence', {sunrise: sun.sunrise, sunset: sun.sunset}) }}</p>
          <p>{{ t('weather.moonPhase', {phase: t(`weather.moon.${sun.phase}`).toLowerCase()}) }}</p>
        </section>
        <p class="updated">{{ t('weather.updatedAt', {date: updatedLabel}) }}</p>
      </template>
    </template>
  </div>
</template>

<style scoped>
.city {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.updated {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  opacity: 0.6;
}

.current {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.current .icon {
  font-size: 3.6rem;
}

.temp {
  font-size: 1.9rem;
  font-weight: 600;
}

.feels-like {
  margin-left: 0.4rem;
  font-size: 0.85rem;
  font-weight: 400;
  opacity: 0.65;
}

.details,
.hint,
.min {
  opacity: 0.65;
  font-size: 0.85rem;
}

.hint {
  margin: 0;
}

.days {
  display: flex;
  justify-content: space-between;
  gap: 0.2rem;
  overflow: hidden;
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
}

.days li {
  min-width: 2.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.days .icon {
  font-size: 1.8rem;
  line-height: 1.2;
}

.day {
  text-transform: capitalize;
  font-size: 0.8rem;
}

.rain {
  margin-top: 0.8rem;
}

.rain h4 {
  margin: 0 0 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.slots {
  display: flex;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.slots li {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.cell {
  width: 100%;
  height: 0.6rem;
  border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  border-radius: 3px;
}

.slot-time {
  font-size: 0.7rem;
  opacity: 0.65;
}

.rain .hint {
  margin-top: 0.3rem;
  font-size: 0.75rem;
}

.legend {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.4rem;
  font-size: 0.7rem;
  opacity: 0.75;
}

.scale {
  flex: 1;
  height: 0.5rem;
  border-radius: 3px;
}

.sun {
  margin-top: 0.8rem;
  font-size: 0.8rem;
  opacity: 0.85;
}

.sun p {
  margin: 0;
}
</style>
