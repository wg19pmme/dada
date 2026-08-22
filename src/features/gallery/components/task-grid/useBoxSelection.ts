import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from 'react'
import { BOX_SELECT_THRESHOLD, isSelectableGridTarget, rectsIntersect, type SelectionBox } from './shared'

interface UseBoxSelectionOptions {
  gridRef: RefObject<HTMLDivElement | null>
  filteredTaskCount: number
  selectedTaskIds: string[]
  clearSelectedTasks: () => void
  setSelectedTaskIds: (taskIds: string[]) => void
  onStartSelection: () => void
}

export function useBoxSelection({
  gridRef,
  filteredTaskCount,
  selectedTaskIds,
  clearSelectedTasks,
  setSelectedTaskIds,
  onStartSelection,
}: UseBoxSelectionOptions) {
  const boxSelectionRef = useRef<{
    startX: number
    startY: number
    additive: boolean
    initialSelectedIds: string[]
    startedOnTaskCard: boolean
    dragging: boolean
  } | null>(null)
  const suppressOpenUntilRef = useRef(0)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)

  useEffect(
    () => () => {
      document.body.style.userSelect = ''
    },
    [],
  )

  const handleGridMouseDownCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !filteredTaskCount || !isSelectableGridTarget(event.target)) return

    onStartSelection()
    const target = event.target instanceof HTMLElement ? event.target : null
    boxSelectionRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      additive: event.ctrlKey || event.metaKey,
      initialSelectedIds: selectedTaskIds,
      startedOnTaskCard: Boolean(target?.closest('[data-task-card-root]')),
      dragging: false,
    }

    const updateSelection = (moveEvent: MouseEvent) => {
      const currentSelection = boxSelectionRef.current
      if (!currentSelection) return

      const deltaX = moveEvent.clientX - currentSelection.startX
      const deltaY = moveEvent.clientY - currentSelection.startY
      const distance = Math.hypot(deltaX, deltaY)
      if (!currentSelection.dragging && distance < BOX_SELECT_THRESHOLD) {
        return
      }

      if (!currentSelection.dragging) {
        currentSelection.dragging = true
        document.body.style.userSelect = 'none'
      }

      const nextBox = {
        left: Math.min(currentSelection.startX, moveEvent.clientX),
        top: Math.min(currentSelection.startY, moveEvent.clientY),
        width: Math.abs(deltaX),
        height: Math.abs(deltaY),
      }
      setSelectionBox(nextBox)

      const boxRect = new DOMRect(nextBox.left, nextBox.top, nextBox.width, nextBox.height)
      const taskCards = Array.from(
        gridRef.current?.querySelectorAll<HTMLElement>('[data-task-card-root][data-task-id]') ?? [],
      )
      const hitTaskIds = taskCards
        .filter((card) => rectsIntersect(card.getBoundingClientRect(), boxRect))
        .map((card) => card.dataset.taskId || '')
        .filter(Boolean)

      setSelectedTaskIds(
        currentSelection.additive
          ? Array.from(new Set([...currentSelection.initialSelectedIds, ...hitTaskIds]))
          : hitTaskIds,
      )
    }

    const finishSelection = () => {
      const currentSelection = boxSelectionRef.current
      if (currentSelection?.dragging) {
        suppressOpenUntilRef.current = Date.now() + 180
      } else if (!currentSelection?.additive && !currentSelection?.startedOnTaskCard) {
        clearSelectedTasks()
      }

      boxSelectionRef.current = null
      setSelectionBox(null)
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', updateSelection)
      window.removeEventListener('mouseup', finishSelection)
    }

    window.addEventListener('mousemove', updateSelection)
    window.addEventListener('mouseup', finishSelection)
  }

  return {
    selectionBox,
    handleGridMouseDownCapture,
    shouldSuppressTaskOpen: () => Date.now() < suppressOpenUntilRef.current,
  }
}
