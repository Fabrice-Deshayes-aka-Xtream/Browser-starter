<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits<{ submit: [name: string, urlTemplate: string]; cancel: [] }>()

const name = ref('')
const urlTemplate = ref('')
const valid = computed(
  () => name.value.trim() !== '' && /^https?:\/\/.+\{query\}/.test(urlTemplate.value.trim()),
)

function onSubmit() {
  if (valid.value) emit('submit', name.value.trim(), urlTemplate.value.trim())
}
</script>

<template>
  <form class="engine-form" @submit.prevent="onSubmit">
    <label>
      {{ $t('search.engineName') }}
      <input v-model="name" placeholder="DuckDuckGo" required />
    </label>
    <label>
      {{ $t('search.engineUrl') }}
      <input v-model="urlTemplate" placeholder="https://duckduckgo.com/?q={query}" required />
      <small>{{ $t('search.engineUrlHint') }}</small>
    </label>
    <div class="actions">
      <button type="submit" class="btn primary" :disabled="!valid">{{ $t('search.save') }}</button>
      <button type="button" class="btn" @click="emit('cancel')">{{ $t('search.cancel') }}</button>
    </div>
  </form>
</template>

<style scoped>
.engine-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
}

small {
  opacity: 0.65;
  word-break: break-all;
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
