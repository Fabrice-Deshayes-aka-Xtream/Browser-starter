<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseDialog from '@/shared/components/BaseDialog.vue'

const props = defineProps<{ open: boolean; name: string }>()
const emit = defineEmits<{ close: []; confirm: [] }>()

const typed = ref('')
const matches = computed(() => typed.value.trim() === props.name)

watch(
  () => props.open,
  () => (typed.value = ''),
)

function onSubmit() {
  if (matches.value) emit('confirm')
}
</script>

<template>
  <BaseDialog :open="open" :title="$t('workspaces.deleteTitle')" @close="emit('close')">
    <form class="delete-form" @submit.prevent="onSubmit">
      <p class="warning">{{ $t('workspaces.deleteWarning', { name }) }}</p>
      <label>
        {{ $t('workspaces.deleteConfirmLabel', { name }) }}
        <input v-model="typed" autocomplete="off" :placeholder="name" />
      </label>
      <div class="actions">
        <button type="submit" class="btn danger" :disabled="!matches">
          {{ $t('workspaces.delete') }}
        </button>
        <button type="button" class="btn" @click="emit('close')">
          {{ $t('workspaces.cancel') }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.delete-form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-width: 24rem;
}

.warning {
  margin: 0;
  color: #e5484d;
  font-size: 0.9rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
