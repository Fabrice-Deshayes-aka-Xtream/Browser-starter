import { ref } from 'vue'

// Shared across the app: a single page is either in view mode or in edit mode.
const editing = ref(false)

export function useEditMode() {
  return { editing, toggle: () => (editing.value = !editing.value) }
}
