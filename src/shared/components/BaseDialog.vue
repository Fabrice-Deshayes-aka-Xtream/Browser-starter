<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement>()

watch(
  () => props.open,
  (open) => {
    if (open && !dialog.value?.open) dialog.value?.showModal()
    if (!open && dialog.value?.open) dialog.value.close()
  },
  { flush: 'post' },
)
</script>

<template>
  <dialog ref="dialog" class="dialog" @close="emit('close')" @cancel.prevent>
    <div v-if="open" class="content">
      <header>
        <h2>{{ title }}</h2>
        <button type="button" class="close" :aria-label="$t('dialog.close')" @click="emit('close')">
          ✕
        </button>
      </header>
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  min-width: min(28rem, 92vw);
  padding: 1.1rem 1.25rem 1.25rem;
  border: 1px solid var(--field-border);
  border-radius: 0.9rem;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 12px 40px rgb(0 0 0 / 0.4);
}

.dialog::backdrop {
  background: rgb(0 0 0 / 0.5);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

h2 {
  margin: 0;
  font-size: 1.05rem;
}

.close {
  border: 0;
  border-radius: 0.4rem;
  background: transparent;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
}

.close:hover {
  opacity: 1;
  background: var(--hover);
}
</style>
