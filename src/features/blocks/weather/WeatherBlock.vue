<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {Block} from '@/core/config/schema'
import {type CachedWeather, fetchWeather, readCachedWeather, type WeatherData} from './weatherApi'
import {conditionIcon} from './weatherCodes'

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

function apply(entry: CachedWeather) {
  data.value = entry.data
  updatedAt.value = entry.time
}

async function refresh() {
  const { city, forecastDays, unit } = props.block.config
  if (!city) return
  loading.value = true
  try {
    if (!data.value) {
      const cached = await readCachedWeather(city, forecastDays, unit)
      if (cached) apply(cached)
    }
    apply(await fetchWeather(city, forecastDays, unit))
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

.day {
  text-transform: capitalize;
  font-size: 0.8rem;
}
</style>
