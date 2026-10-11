<script setup lang="ts">
import BaseDialog from '@/shared/components/BaseDialog.vue'
import type { BlockType } from '@/core/config/schema'
import { blockDefinitions } from '@/features/blocks/blockRegistry'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ pick: [type: BlockType]; close: [] }>()
</script>

<template>
  <BaseDialog :open="open" :title="$t('layout.chooseBlockType')" @close="emit('close')">
    <ul class="types">
      <li v-for="def in blockDefinitions" :key="def.type">
        <button type="button" @click="emit('pick', def.type)">
          <strong>{{ $t(`${def.i18nKey}.name`) }}</strong>
          <span>{{ $t(`${def.i18nKey}.description`) }}</span>
        </button>
      </li>
    </ul>
  </BaseDialog>
</template>

<style scoped>
.types {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

button {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

button:hover {
  background: var(--hover);
}

span {
  font-size: 0.85rem;
  opacity: 0.7;
}
</style>
