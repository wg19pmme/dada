interface PromptLibraryHeaderProps {
  onClose: () => void
}

export default function PromptLibraryHeader({ onClose }: PromptLibraryHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100">
        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M6.75 5.75h7.5a3 3 0 0 1 3 3v8.5a1 1 0 0 1-1.6.8l-2.55-1.9a2 2 0 0 0-2.4 0l-2.55 1.9a1 1 0 0 1-1.6-.8v-8.5a3 3 0 0 1 3-3Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.75 10h4.5M8.75 12.75h3.25" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="m15.75 5.25.42 1.12 1.11.42-1.11.42-.42 1.11-.42-1.11-1.11-.42 1.11-.42.42-1.12Z"
          />
        </svg>
        提示词库
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
        aria-label="关闭提示词库"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
