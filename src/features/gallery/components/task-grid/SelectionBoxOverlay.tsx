import type { SelectionBox } from './shared'

interface SelectionBoxOverlayProps {
  selectionBox: SelectionBox | null
}

export default function SelectionBoxOverlay({ selectionBox }: SelectionBoxOverlayProps) {
  if (!selectionBox) return null

  return (
    <div
      className="pointer-events-none fixed z-[9997] rounded-2xl border border-blue-400/80 bg-blue-400/[0.12] shadow-[0_0_0_1px_rgba(59,130,246,0.18)]"
      style={{
        left: selectionBox.left,
        top: selectionBox.top,
        width: selectionBox.width,
        height: selectionBox.height,
      }}
    />
  )
}
