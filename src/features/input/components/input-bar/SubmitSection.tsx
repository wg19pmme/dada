import { useState } from 'react'
import ButtonTooltip from './ButtonTooltip'

interface SubmitSectionProps {
  generationTargetLabel: string
  hasApiKey: boolean
  canSubmit: boolean
  isMobile: boolean
  onSubmit: () => void
  onOpenSettings: () => void
}

export default function SubmitSection({
  generationTargetLabel,
  hasApiKey,
  canSubmit,
  isMobile,
  onSubmit,
  onOpenSettings,
}: SubmitSectionProps) {
  const [submitHover, setSubmitHover] = useState(false)

  return (
    <div className="mt-auto pt-4">
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <span>保存至</span>
        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          {generationTargetLabel}
        </span>
      </div>

      <div
        className="relative w-full"
        onMouseEnter={() => setSubmitHover(true)}
        onMouseLeave={() => setSubmitHover(false)}
      >
        <ButtonTooltip visible={!hasApiKey && submitHover} text="尚未完成 API 配置，请在右上角设置中进行" />
        <button
          onClick={() => {
            if (hasApiKey) {
              onSubmit()
            } else {
              onOpenSettings()
            }
          }}
          disabled={hasApiKey ? !canSubmit : false}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium shadow-sm transition-all ${
            !hasApiKey
              ? 'cursor-pointer bg-gray-300 text-white dark:bg-white/[0.06]'
              : 'bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-50 dark:disabled:bg-white/[0.04]'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {hasApiKey ? (isMobile ? '生成图像' : '生成图像 (Ctrl+Enter)') : '请先配置 API'}
        </button>
      </div>
    </div>
  )
}
