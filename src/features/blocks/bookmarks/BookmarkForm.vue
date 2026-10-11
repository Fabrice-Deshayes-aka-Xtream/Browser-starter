<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Bookmark } from '@/core/config/schema'
import { blobToIconDataUrl } from '@/shared/utils/image'
import BookmarkIcon from './BookmarkIcon.vue'
import { domainTitle, fetchFavicon, normalizeUrl } from './favicon'

const props = defineProps<{ bookmark?: Bookmark }>()
const emit = defineEmits<{ save: [value: Omit<Bookmark, 'id'>]; cancel: [] }>()

const url = ref(props.bookmark?.url ?? '')
const title = ref(props.bookmark?.title ?? '')
const icon = ref(props.bookmark?.icon)
const busy = ref(false)

const normalizedUrl = computed(() => normalizeUrl(url.value))
const defaultTitle = computed(() => (normalizedUrl.value ? domainTitle(normalizedUrl.value) : ''))
const previewTitle = computed(() => title.value.trim() || defaultTitle.value || '?')

// Only auto-fill what the user has not provided or edited themselves.
const iconIsManual = ref(!!props.bookmark?.icon)
const titleIsManual = ref(!!props.bookmark?.title)
let autoDetectTimer: ReturnType<typeof setTimeout> | undefined

async function onUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  icon.value = await blobToIconDataUrl(file)
  iconIsManual.value = true
}

async function detectIcon() {
  const target = normalizedUrl.value
  if (!target) return
  busy.value = true
  const detected = await fetchFavicon(target)
  busy.value = false
  if (target === normalizedUrl.value) icon.value = detected
}

function redetectIcon() {
  iconIsManual.value = false
  return detectIcon()
}

function removeIcon() {
  icon.value = undefined
  iconIsManual.value = true
}

let pasted = false

function onTitleInput() {
  titleIsManual.value = title.value.trim() !== ''
}

watch(url, () => {
  clearTimeout(autoDetectTimer)
  const delay = pasted ? 0 : 400
  pasted = false
  if (!normalizedUrl.value) return
  if (!titleIsManual.value) title.value = defaultTitle.value
  if (iconIsManual.value) return
  autoDetectTimer = setTimeout(detectIcon, delay)
})

onBeforeUnmount(() => clearTimeout(autoDetectTimer))

async function onSubmit() {
  if (!normalizedUrl.value) return
  clearTimeout(autoDetectTimer)
  if (!icon.value && !iconIsManual.value) await detectIcon()
  emit('save', {
    url: normalizedUrl.value,
    title: title.value.trim() || defaultTitle.value,
    icon: icon.value,
  })
}
</script>

<template>
  <form class="form" @submit.prevent="onSubmit">
    <label>
      {{ $t('bookmarks.url') }}
      <input
        v-model="url"
        required
        autofocus
        placeholder="https://example.com"
        @paste="pasted = true"
      />
    </label>
    <label>
      {{ $t('bookmarks.linkTitle') }}
      <input v-model="title" :placeholder="defaultTitle" @input="onTitleInput" />
    </label>
    <div class="icon-row">
      <BookmarkIcon :bookmark="{ title: previewTitle, icon }" />
      <label class="btn file">
        {{ $t('bookmarks.upload') }}
        <input type="file" accept="image/*" hidden @change="onUpload" />
      </label>
      <button
        type="button"
        class="btn"
        :disabled="!normalizedUrl || busy"
        @click="redetectIcon"
      >
        {{ $t('bookmarks.autoIcon') }}
      </button>
      <button type="button" class="btn" :disabled="!icon" @click="removeIcon">
        {{ $t('bookmarks.removeIcon') }}
      </button>
    </div>
    <div class="actions">
      <button type="submit" class="btn primary" :disabled="!normalizedUrl || busy">
        {{ $t('bookmarks.save') }}
      </button>
      <button type="button" class="btn" @click="emit('cancel')">
        {{ $t('bookmarks.cancel') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.icon-row,
.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.file {
  flex-direction: row;
  align-items: center;
}
</style>
