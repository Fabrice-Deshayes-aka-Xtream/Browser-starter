<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLayout } from '@/features/layout/useLayout'
import type { Block, Bookmark, BookmarksBlockConfig } from '@/core/config/schema'
import { createId } from '@/core/config/defaults'
import BaseDialog from '@/shared/components/BaseDialog.vue'
import { useSortableList } from '@/shared/composables/useSortableList'
import BookmarkForm from './BookmarkForm.vue'
import BookmarkIcon from './BookmarkIcon.vue'

const props = defineProps<{
  block: Extract<Block, { type: 'bookmarks' }>
  editing: boolean
}>()
const emit = defineEmits<{ 'update-config': [config: BookmarksBlockConfig] }>()

const list = ref<HTMLElement>()
const layout = useLayout()
// `null` = adding a new link, a bookmark = editing it, `undefined` = dialog closed.
const formTarget = ref<Bookmark | null | undefined>(undefined)

const links = computed(() => props.block.config.links)
const tiles = computed(() => props.block.config.display === 'tiles')
const iconSize = computed(() => {
  if (!tiles.value) return '1.4rem'
  return props.block.config.tileSize === 'small' ? '1.8rem' : '2.6rem'
})

function update(patch: Partial<BookmarksBlockConfig>) {
  emit('update-config', { ...props.block.config, ...patch })
}

function removeLink(id: string) {
  update({ links: links.value.filter((l) => l.id !== id) })
}

function saveLink(value: Omit<Bookmark, 'id'>) {
  const target = formTarget.value
  update({
    links: target
      ? links.value.map((l) => (l.id === target.id ? { ...value, id: target.id } : l))
      : [...links.value, { ...value, id: createId() }],
  })
  formTarget.value = undefined
}

useSortableList(list, {
  group: 'bookmarks',
  handle: '.link',
  enabled: computed(() => props.editing),
  onReorder: (from, to) => {
    const next = [...links.value]
    next.splice(to, 0, next.splice(from, 1)[0]!)
    update({ links: next })
  },
  onTransfer: (item, from, to, newIndex) =>
    layout.moveBookmark(
      item.dataset.linkId!,
      from.dataset.blockId!,
      to.dataset.blockId!,
      newIndex,
    ),
})
</script>

<template>
  <div class="bookmarks">
    <div v-if="editing" class="header">
      <input
        class="title-input"
        :value="block.config.title"
        :placeholder="$t('bookmarks.titlePlaceholder')"
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
      <select
        :value="block.config.display"
        :aria-label="$t('bookmarks.display')"
        @change="
          update({ display: ($event.target as HTMLSelectElement).value as 'list' | 'tiles' })
        "
      >
        <option value="list">{{ $t('bookmarks.displayList') }}</option>
        <option value="tiles">{{ $t('bookmarks.displayTiles') }}</option>
      </select>
      <select
        v-if="tiles"
        :value="block.config.tileSize"
        :aria-label="$t('bookmarks.tileSize')"
        @change="
          update({ tileSize: ($event.target as HTMLSelectElement).value as 'small' | 'normal' })
        "
      >
        <option value="small">{{ $t('bookmarks.tileSizeSmall') }}</option>
        <option value="normal">{{ $t('bookmarks.tileSizeNormal') }}</option>
      </select>
    </div>
    <h3 v-else-if="block.config.title" class="title">{{ block.config.title }}</h3>

    <ul
      ref="list"
      class="links"
      :class="[{ tiles, editing }, tiles && block.config.tileSize]"
    >
      <li
        v-for="link in links"
        :key="link.id"
        class="link"
        :data-link-id="link.id"
      >
        <a
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          :title="link.title"
          @click="editing && $event.preventDefault()"
        >
          <BookmarkIcon :bookmark="link" :size="iconSize" />
          <span class="label">{{ link.title }}</span>
        </a>
        <span v-if="editing" class="actions">
          <button type="button" :aria-label="$t('bookmarks.editLink')" @click="formTarget = link">
            ✎
          </button>
          <button type="button" :aria-label="$t('bookmarks.remove')" @click="removeLink(link.id)">
            ✕
          </button>
        </span>
      </li>
    </ul>

    <p v-if="!links.length && !editing" class="empty">{{ $t('bookmarks.empty') }}</p>
    <button v-if="editing" type="button" class="add" @click="formTarget = null">
      + {{ $t('bookmarks.addLink') }}
    </button>

    <BaseDialog
      :open="formTarget !== undefined"
      :title="formTarget ? $t('bookmarks.editLink') : $t('bookmarks.addLink')"
      @close="formTarget = undefined"
    >
      <BookmarkForm
        :bookmark="formTarget ?? undefined"
        @save="saveLink"
        @cancel="formTarget = undefined"
      />
    </BaseDialog>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 0.6rem;
  font-size: 1rem;
}

.header {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}

.title-input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-weight: 600;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.links.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4.6rem, 1fr));
  gap: 0.6rem 0.3rem;
}

.links.tiles.small {
  grid-template-columns: repeat(auto-fill, minmax(3.4rem, 1fr));
  gap: 0.4rem 0.2rem;
}

.tiles.small .label {
  font-size: 0.7rem;
}

.links.editing .link {
  cursor: grab;
}

.link {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tiles .link {
  flex-direction: column;
  gap: 0.1rem;
}

.link a {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  padding: 0.3rem 0.4rem;
  border-radius: 0.4rem;
  color: inherit;
  text-decoration: none;
}

.tiles .link a {
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  flex: none;
}

.link a:hover {
  background: var(--hover);
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tiles .label {
  max-width: 100%;
  font-size: 0.78rem;
}

.actions {
  display: flex;
}

.link button,
.add {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.add {
  margin-top: 0.4rem;
  padding: 0.3rem;
  border: 1px dashed var(--border);
  border-radius: 0.4rem;
}

.empty {
  margin: 0;
  opacity: 0.6;
}
</style>
