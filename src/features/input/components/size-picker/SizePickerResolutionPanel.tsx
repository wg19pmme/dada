import type { Dispatch, SetStateAction } from 'react'

interface SizePickerResolutionPanelProps {
  customW: string
  setCustomW: Dispatch<SetStateAction<string>>
  customH: string
  setCustomH: Dispatch<SetStateAction<string>>
}

export default function SizePickerResolutionPanel({
  customW,
  setCustomW,
  customH,
  setCustomH,
}: SizePickerResolutionPanelProps) {
  return (
    <div className="animate-fade-in space-y-5">
      <section>
        <div className="mb-4 text-xs font-medium text-gray-400 dark:text-gray-500">输入具体像素值</div>
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <span className="mb-1.5 block text-xs text-gray-500 dark:text-gray-400">宽度 (Width)</span>
            <input
              type="number"
              value={customW}
              onChange={(event) => setCustomW(event.target.value)}
              className="w-full rounded-xl border border-gray-200/70 bg-white/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-200 dark:focus:border-blue-500/50"
              placeholder="例如 1024"
            />
          </label>
          <div className="mt-5 text-gray-300 dark:text-gray-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <label className="flex-1">
            <span className="mb-1.5 block text-xs text-gray-500 dark:text-gray-400">高度 (Height)</span>
            <input
              type="number"
              value={customH}
              onChange={(event) => setCustomH(event.target.value)}
              className="w-full rounded-xl border border-gray-200/70 bg-white/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-300 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-200 dark:focus:border-blue-500/50"
              placeholder="例如 1024"
            />
          </label>
        </div>
      </section>

      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
        <p className="flex items-start gap-1.5">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>最终尺寸会同时满足 16 倍数、最长边 3840、长宽比不超过 3:1，并自动补齐到合法像素范围。</span>
        </p>
      </div>
    </div>
  )
}
