<script setup lang="ts">
import type { EngineView } from '../engines'

defineProps<{ engine: EngineView }>()
</script>

<template>
  <span v-if="engine.icon" class="engine-icon favicon" aria-hidden="true">
    <img :src="engine.icon" alt="" />
  </span>
  <span v-else-if="engine.iconPath" class="engine-icon logo" aria-hidden="true">
    <svg viewBox="0 0 24 24" :fill="engine.color" fill-rule="evenodd">
      <path :d="engine.iconPath" />
    </svg>
  </span>
  <span v-else class="engine-icon letter" :style="{ background: engine.color }" aria-hidden="true">
    {{ engine.name.charAt(0).toUpperCase() }}
  </span>
</template>

<style scoped>
.engine-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.favicon {
  background: var(--bubble-bg);
  box-shadow: inset 0 0 0 1px var(--bubble-border);
}

.favicon img {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.logo {
  background: #fff;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12);
}

.logo svg {
  width: 70%;
  height: 70%;
}

.letter {
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}
</style>
