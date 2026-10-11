<script setup lang="ts">
import type { Bookmark } from '@/core/config/schema'

withDefaults(defineProps<{ bookmark: Pick<Bookmark, 'title' | 'icon'>; size?: string }>(), {
  size: '1.4rem',
})
</script>

<template>
  <img v-if="bookmark.icon" class="icon" :src="bookmark.icon" :style="{ '--size': size }" alt="" />
  <span v-else class="icon fallback" :style="{ '--size': size }" aria-hidden="true">
    {{ bookmark.title.charAt(0).toUpperCase() }}
  </span>
</template>

<style scoped>
.icon {
  width: var(--size);
  height: var(--size);
  flex-shrink: 0;
  border-radius: 0.3rem;
  object-fit: contain;
}

.fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--hover);
  font-size: calc(var(--size) * 0.5);
  font-weight: 700;
}
</style>
