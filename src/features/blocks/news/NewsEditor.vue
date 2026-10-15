<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createId } from '@/core/config/defaults'
import type { NewsBlockConfig } from '@/core/config/schema'
import { getPresetCategories, type PresetFeed } from './presets/presets'

const props = defineProps<{ config: NewsBlockConfig }>()
const emit = defineEmits<{ save: [config: NewsBlockConfig]; cancel: [] }>()

const { t, locale } = useI18n()
const draft = ref<NewsBlockConfig>({
  ...props.config,
  feeds: props.config.feeds.map((f) => ({ ...f })),
})
const newUrl = ref('')
const newTitle = ref('')
const mode = ref<'preset' | 'custom'>('preset')

const categories = computed(() => getPresetCategories(locale.value))
const categoryId = ref(categories.value[0]?.id ?? '')
const categoryFeeds = computed(
  () => categories.value.find((c) => c.id === categoryId.value)?.feeds ?? [],
)

const newUrlValid = computed(() => /^https?:\/\/.+/i.test(newUrl.value.trim()))

function isAdded(url: string) {
  return draft.value.feeds.some((f) => f.url === url)
}

function addPreset(feed: PresetFeed) {
  if (isAdded(feed.url)) return
  draft.value.feeds.push({ id: createId(), url: feed.url, title: feed.title })
}

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
        <span class="url" :title="feed.url"
          >{{ feed.title ? `${feed.title} – ` : '' }}{{ feed.url }}</span
        >
        <button type="button" :aria-label="t('news.removeFeed')" @click="removeFeed(feed.id)">
          ✕
        </button>
      </li>
    </ul>
    <div class="modes" role="tablist">
      <button
        type="button"
        role="tab"
        class="btn"
        :class="{ primary: mode === 'preset' }"
        :aria-selected="mode === 'preset'"
        @click="mode = 'preset'"
      >
        {{ t('news.modePreset') }}
      </button>
      <button
        type="button"
        role="tab"
        class="btn"
        :class="{ primary: mode === 'custom' }"
        :aria-selected="mode === 'custom'"
        @click="mode = 'custom'"
      >
        {{ t('news.modeCustom') }}
      </button>
    </div>
    <div v-if="mode === 'preset'" class="preset">
      <label>
        {{ t('news.category') }}
        <select v-model="categoryId">
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ t(`news.categories.${c.id}`) }}
          </option>
        </select>
      </label>
      <ul class="feeds">
        <li v-for="feed in categoryFeeds" :key="feed.url">
          <span class="url">{{ feed.title }}</span>
          <button
            type="button"
            class="btn"
            :disabled="isAdded(feed.url)"
            @click="addPreset(feed)"
          >
            {{ isAdded(feed.url) ? '✓' : t('news.addPreset') }}
          </button>
        </li>
      </ul>
    </div>
    <div v-else class="add">
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
    <label>
      {{ t('news.itemIcon') }}
      <select v-model="draft.itemIcon">
        <option value="thumbnail">{{ t('news.iconThumbnail') }}</option>
        <option value="favicon">{{ t('news.iconFavicon') }}</option>
        <option value="none">{{ t('news.iconNone') }}</option>
      </select>
    </label>
    <div class="actions">
      <button type="submit" class="btn primary">{{ t('news.save') }}</button>
      <button type="button" class="btn" @click="emit('cancel')">{{ t('news.cancel') }}</button>
    </div>
  </form>
</template>

<style scoped>
.form {
  min-width: 0;
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
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.url {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preset {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preset .feeds {
  margin-left: 1rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--field-border);
}

.preset .feeds li {
  align-items: center;
}

.modes,
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
