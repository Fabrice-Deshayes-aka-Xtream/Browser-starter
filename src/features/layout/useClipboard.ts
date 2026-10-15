import { ref } from 'vue'
import type { Block } from '@/core/config/schema'

// Snapshot of the copied block; module-level so it survives workspace switches.
export const copiedBlock = ref<Block | null>(null)
