<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Block } from '@/core/config/schema'
import type { NewsItem } from './feedParser'
import { fetchNews } from './newsApi'

const props = defineProps<{ block: Extract<Block, { type: 'news' }> }>()

const REFRESH_MS = 15 * 60 * 1000
const { t, locale } = useI18n()

const items = ref<NewsItem[]>([])
const failedFeeds = ref(0)
const loading = ref(false)

async function refresh() {
  if (!props.block.config.feeds.length) {
    items.value = []
    return
  }
  loading.value = true
  const result = await fetchNews(props.block.config)
  items.value = result.items
  failedFeeds.value = result.failedFeeds
  loading.value = false
}

function relativeTime(date?: number): string {
  if (!date) return ''
  const minutes = Math.round((date - Date.now()) / 60_000)
  const format = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  if (Math.abs(minutes) < 60) return format.format(minutes, 'minute')
  if (Math.abs(minutes) < 1440) return format.format(Math.round(minutes / 60), 'hour')
  return format.format(Math.round(minutes / 1440), 'day')
}

watch(() => props.block.config, refresh, { immediate: true, deep: true })
const timer = setInterval(refresh, REFRESH_MS)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="news">
    <h3 v-if="block.config.title" class="block-title">{{ block.config.title }}</h3>
    <p v-if="!block.config.feeds.length" class="hint">{{ t('news.noFeeds') }}</p>
    <p v-else-if="loading && !items.length" class="hint">{{ t('news.loading') }}</p>
    <ul v-else class="items">
      <li v-for="item in items" :key="item.link">
        <a :href="item.link" target="_blank" rel="noopener noreferrer">
          <img v-if="item.image && block.config.showThumbnails" :src="item.image" alt="" loading="lazy" />
          <span class="text">
            <span class="title">{{ item.title }}</span>
            <span class="meta">{{ item.source }} · {{ relativeTime(item.date) }}</span>
          </span>
        </a>
      </li>
    </ul>
    <p v-if="failedFeeds" class="hint">{{ t('news.failed', { count: failedFeeds }) }}</p>
  </div>
</template>

<style scoped>
.block-title {
  margin: 0 0 0.6rem;
  font-size: 1rem;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

a {
  display: flex;
  gap: 0.6rem;
  color: inherit;
  text-decoration: none;
}

a:hover .title {
  text-decoration: underline;
}

img {
  width: 4.5rem;
  height: 3.2rem;
  flex-shrink: 0;
  border-radius: 0.4rem;
  object-fit: cover;
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title {
  font-size: 0.92rem;
}

.meta,
.hint {
  font-size: 0.78rem;
  opacity: 0.65;
}

.hint {
  margin: 0.4rem 0 0;
}
</style>
