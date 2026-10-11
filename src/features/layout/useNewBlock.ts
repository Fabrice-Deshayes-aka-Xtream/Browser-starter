import { ref } from 'vue'

// Id of a just-added block whose settings dialog must open on mount.
export const newBlockId = ref<string | null>(null)
