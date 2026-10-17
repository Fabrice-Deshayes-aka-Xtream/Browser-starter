<script setup lang="ts">
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import type {TodayBlockConfig} from '@/core/config/schema'

const props = defineProps<{ config: TodayBlockConfig }>()
const emit = defineEmits<{ save: [config: TodayBlockConfig]; cancel: [] }>()

const {t} = useI18n()
const draft = ref<TodayBlockConfig>({...props.config})
const zonesText = ref(props.config.timezones.join(', '))

const zones = computed(() =>
  zonesText.value
    .split(',')
    .map((zone) => zone.trim())
    .filter(Boolean),
)

const isValidZone = (zone: string) => {
  try {
    new Intl.DateTimeFormat('en', {timeZone: zone})
    return true
  } catch {
    return false
  }
}

const invalidZones = computed(() => zones.value.filter((zone) => !isValidZone(zone)))

function save() {
  if (invalidZones.value.length) return
  emit('save', {...draft.value, timezones: zones.value})
}
</script>

<template>
  <form class="form" @submit.prevent="save">
    <label class="check">
      <input v-model="draft.showDate" type="checkbox"/>
      {{ t('today.showDate') }}
    </label>
    <label class="check">
      <input v-model="draft.showTime" type="checkbox"/>
      {{ t('today.showTime') }}
    </label>
    <label v-if="draft.showTime">
      {{ t('today.timezones') }}
      <input v-model="zonesText" placeholder="America/New_York, Asia/Tokyo"/>
      <small class="help">{{ t('today.timezonesHint') }}</small>
      <small v-if="invalidZones.length" class="error">
        {{ t('today.invalidTimezones', {list: invalidZones.join(', ')}) }}
      </small>
    </label>
    <label class="check">
      <input v-model="draft.showEvents" type="checkbox"/>
      {{ t('today.showEvents') }}
    </label>
    <template v-if="draft.showEvents">
      <label>
        {{ t('today.icalUrl') }}
        <input v-model="draft.icalUrl" type="url" placeholder="https://…/calendar.ics"/>
      </label>
      <label>
        {{ t('today.eventCount') }}
        <input v-model.number="draft.eventCount" type="number" min="1" max="50"/>
      </label>
    </template>
    <div class="actions">
      <button type="submit" class="btn primary" :disabled="invalidZones.length > 0">
        {{ t('today.save') }}
      </button>
      <button type="button" class="btn" @click="emit('cancel')">{{ t('today.cancel') }}</button>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

label.check {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.help {
  opacity: 0.65;
}

.error {
  color: #d33;
}
</style>
