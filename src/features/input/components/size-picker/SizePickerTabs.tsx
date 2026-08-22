import type { SizePickerMode } from './shared'

interface SizePickerTabsProps {
  mode: SizePickerMode
  onModeChange: (mode: SizePickerMode) => void
}

export default function SizePickerTabs({
  mode,
  onModeChange,
}: SizePickerTabsProps) {
  return (
    <div className="flex rounded-xl bg-gray-100/80 p-1 dark:bg-white/[0.04]">
      <button
        type="button"
        onClick={() => onModeChange('auto')}
        className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
          mode === 'auto'
            ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        自动
      </button>
      <button
        type="button"
        onClick={() => onModeChange('ratio')}
        className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
          mode === 'ratio'
            ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        按比例
      </button>
      <button
        type="button"
        onClick={() => onModeChange('resolution')}
        className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
          mode === 'resolution'
            ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        自定义宽高
      </button>
    </div>
  )
}
