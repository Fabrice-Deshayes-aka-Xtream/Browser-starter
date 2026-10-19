<script setup lang="ts">
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'
import type {WeatherBlockConfig} from '@/core/config/schema'
import {searchCities} from './weatherApi'

const props = defineProps<{ config: WeatherBlockConfig }>()
const emit = defineEmits<{ save: [config: WeatherBlockConfig]; cancel: [] }>()

const { t, locale } = useI18n()
const draft = ref<WeatherBlockConfig>({ ...props.config })
const query = ref('')
const results = ref<NonNullable<WeatherBlockConfig['city']>[]>([])
const searchFailed = ref(false)

async function search() {
  if (!query.value.trim()) return
  searchFailed.value = false
  try {
    results.value = await searchCities(query.value.trim(), locale.value)
  } catch {
    results.value = []
    searchFailed.value = true
  }
}

function pick(city: NonNullable<WeatherBlockConfig['city']>) {
  draft.value.city = city
  results.value = []
  query.value = ''
}
</script>

<template>
  <form class="form" @submit.prevent="emit('save', draft)">
    <p v-if="draft.city" class="current">{{ draft.city.name }} ({{ draft.city.country }})</p>
    <div class="search">
      <input
        v-model="query"
        :placeholder="t('weather.searchCity')"
        @keydown.enter.prevent="search"
      />
      <button type="button" class="btn" @click="search">{{ t('weather.search') }}</button>
    </div>
    <p v-if="searchFailed" class="error">{{ t('weather.error') }}</p>
    <ul v-if="results.length" class="results">
      <li v-for="city in results" :key="`${city.latitude},${city.longitude}`">
        <button type="button" @click="pick(city)">{{ city.name }}, {{ city.country }}</button>
      </li>
    </ul>
    <label>
      {{ t('weather.forecastDays') }}
      <input v-model.number="draft.forecastDays" type="number" min="1" max="7" />
    </label>
    <label>
      {{ t('weather.unit') }}
      <select v-model="draft.unit">
        <option value="celsius">°C</option>
        <option value="fahrenheit">°F</option>
      </select>
    </label>
    <label>
      {{ t('weather.refreshMinutes') }}
      <select v-model.number="draft.refreshMinutes">
        <option v-for="m in [5, 15, 30, 60, 180, 360]" :key="m" :value="m">
          {{ t('weather.refreshOption', {value: m}) }}
        </option>
      </select>
    </label>
    <label class="check">
      <input v-model="draft.showRainHour" type="checkbox"/>
      {{ t('weather.showRainHour') }}
    </label>
    <label class="check">
      <input v-model="draft.showSunMoon" type="checkbox"/>
      {{ t('weather.showSunMoon') }}
    </label>
    <div class="actions">
      <button type="submit" class="btn primary">{{ t('weather.save') }}</button>
      <button type="button" class="btn" @click="emit('cancel')">{{ t('weather.cancel') }}</button>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search,
.actions {
  display: flex;
  gap: 0.5rem;
}

.search input {
  flex: 1;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.current {
  margin: 0;
  font-weight: 600;
}

.check {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.error {
  margin: 0;
  color: #d33;
}

.results {
  margin: 0;
  padding: 0;
  list-style: none;
}

.results button {
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.results button:hover {
  background: var(--hover);
}
</style>
