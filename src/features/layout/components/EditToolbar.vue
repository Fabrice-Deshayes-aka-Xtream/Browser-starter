<script setup lang="ts">
import { MAX_COLUMNS } from '../layoutOperations'
import { useEditMode } from '@/shared/composables/useEditMode'
import { useLayout } from '../useLayout'

const { editing, toggle } = useEditMode()
const layout = useLayout()
</script>

<template>
  <div class="toolbar">
    <template v-if="editing">
      <label>
        {{ $t('layout.columns') }}
        <input
          type="number"
          min="1"
          :max="MAX_COLUMNS"
          :value="layout.columns.value.length"
          @change="layout.setColumnCount(Number(($event.target as HTMLInputElement).value))"
        />
      </label>
    </template>
    <button type="button" class="toggle" @click="toggle">
      {{ editing ? $t('layout.done') : $t('layout.edit') }}
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  background: var(--surface);
  box-shadow: 0 2px 12px rgb(0 0 0 / 0.3);
}

input {
  width: 3.5rem;
}

.toggle {
  padding: 0.4rem 0.9rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font: inherit;
  cursor: pointer;
}
</style>
