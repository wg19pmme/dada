import { useStore } from '../../store'

export default function Header() {
  const setShowPromptLibrary = useStore((s) => s.setShowPromptLibrary)

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-white/[0.08]">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-4">
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-gray-800 dark:text-gray-100 sm:text-base">
          GPT Image Playground
        </h1>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={() => setShowPromptLibrary(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/80 bg-white/90 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 dark:border-white/[0.08] dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-white/[0.06]"
            title="提示词库"
            aria-label="打开提示词库"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </button>
        </div>
      </div>
    </header>
  )
}
