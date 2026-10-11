<script setup lang="ts">
import { ref } from 'vue'
import SettingsDialog from './SettingsDialog.vue'

const open = ref(false)
</script>

<template>
  <button type="button" class="gear" :aria-label="$t('settings.title')" @click="open = true">
    ⚙
  </button>
  <SettingsDialog :open="open" @close="open = false" />
</template>

<style scoped>
.gear {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 5;
  width: 2.4rem;
  height: 2.4rem;
  border: 0;
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
  cursor: pointer;
}
</style>
