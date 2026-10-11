import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import Sortable from 'sortablejs'

interface Options {
  handle: string
  enabled: Ref<boolean>
  onReorder: (oldIndex: number, newIndex: number) => void
  /** Sortable group: items can be dragged between lists sharing the same group. */
  group?: string
  /** Called when an item is dropped into another list of the same group. */
  onTransfer?: (item: HTMLElement, from: HTMLElement, to: HTMLElement, newIndex: number) => void
}

/** Makes the children of `list` sortable while keeping Vue in charge of the DOM. */
export function useSortableList(list: Ref<HTMLElement | undefined>, options: Options) {
  let sortable: Sortable | undefined

  onMounted(() => {
    sortable = Sortable.create(list.value!, {
      group: options.group,
      handle: options.handle,
      animation: 150,
      disabled: !options.enabled.value,
      onEnd: ({ item, from, to, oldIndex, newIndex }) => {
        item.remove()
        from.insertBefore(item, from.children[oldIndex!] ?? null)
        if (from !== to) options.onTransfer?.(item, from, to, newIndex!)
        else if (oldIndex !== newIndex) options.onReorder(oldIndex!, newIndex!)
      },
    })
  })

  watch(options.enabled, (value) => sortable?.option('disabled', !value))
  onBeforeUnmount(() => sortable?.destroy())
}
