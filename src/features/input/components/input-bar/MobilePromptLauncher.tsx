interface MobilePromptLauncherProps {
  normalizedPrompt: string
  promptPreview: string
  onOpen: () => void
}

export default function MobilePromptLauncher({
  normalizedPrompt,
  promptPreview,
  onOpen,
}: MobilePromptLauncherProps) {
  return (
    <div
      className="fixed inset-x-3 z-40 md:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
    >
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-2xl border border-gray-200/80 bg-white/[0.92] px-3.5 py-3 text-left shadow-[0_18px_42px_-28px_rgba(15,23,42,0.65)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:shadow-[0_24px_48px_-30px_rgba(37,99,235,0.35)] dark:border-white/[0.08] dark:bg-gray-900/[0.88]"
        aria-label="输入提示词"
      >
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_14px_30px_-20px_rgba(37,99,235,0.95)]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-100">
            <span>写提示词</span>
            {normalizedPrompt && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                {normalizedPrompt.length} 字
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-gray-500 dark:text-gray-400">
            {normalizedPrompt ? promptPreview : '点击这里输入提示词、上传参考图和调整参数'}
          </span>
        </span>
        <svg className="h-5 w-5 flex-shrink-0 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
