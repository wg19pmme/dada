export default function ButtonTooltip({ visible, text }: { visible: boolean; text: string }) {
  if (!visible) return null

  return (
    <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
      <div className="relative rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg">
        {text}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  )
}
