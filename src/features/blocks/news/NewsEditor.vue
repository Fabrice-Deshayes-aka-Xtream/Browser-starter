<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createId } from '@/core/config/defaults'
import type { NewsBlockConfig } from '@/core/config/schema'

const props = defineProps<{ config: NewsBlockConfig }>()
const emit = defineEmits<{ save: [config: NewsBlockConfig]; cancel: [] }>()

const { t } = useI18n()
const draft = ref<NewsBlockConfig>({
  ...props.config,
  feeds: props.config.feeds.map((f) => ({ ...f })),
})
const newUrl = ref('')
const newTitle = ref('')

const newUrlValid = computed(() => /^https?:\/\/.+/i.test(newUrl.value.trim()))

function addFeed() {
  if (!newUrlValid.value) return
  draft.value.feeds.push({
    id: createId(),
    url: newUrl.value.trim(),
    title: newTitle.value.trim() || undefined,
  })
  newUrl.value = ''
  newTitle.value = ''
}

function removeFeed(id: string) {
  draft.value.feeds = draft.value.feeds.filter((f) => f.id !== id)
}
</script>

<template>
  <form class="form" @submit.prevent="emit('save', draft)">
    <label>
      {{ t('news.blockTitle') }}
      <input v-model="draft.title" :placeholder="t('news.blockTitlePlaceholder')" />
    </label>
    <ul class="feeds">
      <li v-for="feed in draft.feeds" :key="feed.id">
        <span class="url">{{ feed.title ? `${feed.title} – ` : '' }}{{ feed.url }}</span>
        <button type="button" :aria-label="t('news.removeFeed')" @click="removeFeed(feed.id)">
          ✕
        </button>
      </li>
    </ul>
    <div class="add">
      <input v-model="newUrl" :placeholder="t('news.feedUrl')" @keydown.enter.prevent="addFeed" />
      <input
        v-model="newTitle"
        :placeholder="t('news.feedTitle')"
        @keydown.enter.prevent="addFeed"
      />
      <button type="button" class="btn" :disabled="!newUrlValid" @click="addFeed">
        {{ t('news.addFeed') }}
      </button>
    </div>
    <label>
      {{ t('news.maxItems') }}
      <input v-model.number="draft.maxItems" type="number" min="1" max="50" />
    </label>
    <label class="check">
      <input v-model="draft.showThumbnails" type="checkbox" />
      {{ t('news.showThumbnails') }}
    </label>
    <div class="actions">
      <button type="submit" class="btn primary">{{ t('news.save') }}</button>
      <button type="button" class="btn" @click="emit('cancel')">{{ t('news.cancel') }}</button>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feeds {
  margin: 0;
  padding: 0;
  list-style: none;
}

.feeds li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.add input {
  flex: 1 1 10rem;
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

.feeds button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
</style>
