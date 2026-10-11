interface DragHandlers {
  onStart?: () => void
  /** Receives the cumulative pointer offset since the drag started. */
  onMove: (dx: number, dy: number) => void
  onEnd?: () => void
}

export function useDrag(handlers: DragHandlers) {
  function start(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement
    const originX = event.clientX
    const originY = event.clientY
    target.setPointerCapture(event.pointerId)
    handlers.onStart?.()

    const move = (e: PointerEvent) => handlers.onMove(e.clientX - originX, e.clientY - originY)
    const end = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', end)
      target.removeEventListener('pointercancel', end)
      handlers.onEnd?.()
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', end)
    target.addEventListener('pointercancel', end)
  }

  return { start }
}
