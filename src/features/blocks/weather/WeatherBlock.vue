<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {Block} from '@/core/config/schema'
import {type CachedWeather, fetchWeather, readCachedWeather, type WeatherData} from './weatherApi'
import {conditionIcon} from './weatherCodes'
import {moonIcon, moonPhase} from './moonPhase'
import {rainColor, rainGradient, rainLevel} from './rainScale'

const props = defineProps<{ block: Extract<Block, { type: 'weather' }> }>()

const { t, locale } = useI18n()

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

const legendGradient = rainGradient()
const rainSlots = computed(() =>
  props.block.config.showRainHour && data.value?.rain ? data.value.rain : undefined,
)
const hasRain = computed(() => rainSlots.value?.some((slot) => rainLevel(slot.precipitation) !== 'none'))
const sun = computed(() => {
  const value = props.block.config.showSunMoon ? data.value?.sun : undefined
  if (!value) return undefined
  const phase = moonPhase(new Date(`${value.date}T12:00:00Z`))
  return {sunrise: value.sunrise.slice(11, 16), sunset: value.sunset.slice(11, 16), phase}
})
const slotTitle = (time: string, mm: number) =>
  `${time.slice(11, 16)} · ${t(`weather.rain${rainLevel(mm).replace(/^./, (c) => c.toUpperCase())}`)} (${mm.toFixed(1)} mm)`

function apply(entry: CachedWeather) {
  data.value = entry.data
  updatedAt.value = entry.time
}

async function refresh() {
  const {city, forecastDays, unit, showRainHour, showSunMoon} = props.block.config
  if (!city) return
  loading.value = true
  try {
    if (!data.value) {
      const cached = await readCachedWeather(city, forecastDays, unit)
      if (cached) apply(cached)
    }
    apply(await fetchWeather(city, forecastDays, unit, {rain: showRainHour, sun: showSunMoon}))
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
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="weather">
    <p v-if="!block.config.city" class="hint">{{ t('weather.noCity') }}</p>
    <template v-else>
      <h3 class="city">{{ block.config.city.name }}</h3>
      <p v-if="error" class="hint">{{ t('weather.error') }}</p>
      <p v-else-if="loading && !data" class="hint">{{ t('weather.loading') }}</p>
      <template v-if="data">
        <div class="current">
          <span class="icon">{{ conditionIcon(data.current.condition) }}</span>
          <div>
            <div class="temp">{{ round(data.current.temperature) }}{{ unitSymbol }}</div>
            <div class="details">
              {{ t(`weather.conditions.${data.current.condition}`) }} ·
              {{ t('weather.humidity', { value: data.current.humidity }) }} ·
              {{ t('weather.wind', { value: round(data.current.wind) }) }}
            </div>
          </div>
        </div>
        <ul class="days">
          <li v-for="day in data.days" :key="day.date">
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
            <span>{{ t('weather.rainNone') }}</span>
            <span class="scale" :style="{ background: legendGradient }"></span>
            <span>{{ t('weather.rainHeavy') }}</span>
          </div>
        </section>
        <section v-if="sun" class="sun">
          <span>🌅 {{ t('weather.sunrise') }} {{ sun.sunrise }}</span>
          <span>🌇 {{ t('weather.sunset') }} {{ sun.sunset }}</span>
          <span>{{ moonIcon(sun.phase) }} {{ t(`weather.moon.${sun.phase}`) }}</span>
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
  font-size: 2.6rem;
}

.temp {
  font-size: 1.9rem;
  font-weight: 600;
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
  gap: 0.4rem;
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
}

.days li {
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
  gap: 0.25rem;
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
  height: 1.4rem;
  border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  border-radius: 4px;
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
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.3rem 0.8rem;
  margin-top: 0.8rem;
  font-size: 0.8rem;
}
</style>
