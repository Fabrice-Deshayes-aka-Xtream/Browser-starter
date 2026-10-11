<script setup lang="ts">
import { ref } from 'vue'
import AboutDialog from './AboutDialog.vue'

const open = ref(false)
</script>

<template>
  <button type="button" class="info" :aria-label="$t('about.title')" @click="open = true">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2" />
      <circle cx="12" cy="7.8" r="1.3" fill="currentColor" />
      <path d="M12 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>
  <AboutDialog :open="open" @close="open = false" />
</template>

<style scoped>
.info {
  position: fixed;
  top: 1rem;
  right: 4rem;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
  cursor: pointer;
}
</style>
