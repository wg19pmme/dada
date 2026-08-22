import type { RefObject } from 'react'

interface ReferenceImageUrlPopoverProps {
  imageUrlInput: string
  imageUrlInputRef: RefObject<HTMLInputElement | null>
  imageUrlPopoverRef: RefObject<HTMLDivElement | null>
  onImageUrlInputChange: (value: string) => void
  onCancelImageUrl: () => void
  onSubmitImageUrl: () => void
}

export default function ReferenceImageUrlPopover({
  imageUrlInput,
  imageUrlInputRef,
  imageUrlPopoverRef,
  onImageUrlInputChange,
  onCancelImageUrl,
  onSubmitImageUrl,
}: ReferenceImageUrlPopoverProps) {
  return (
    <div
      ref={imageUrlPopoverRef}
      className="absolute right-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-gray-200/80 bg-white/[0.96] p-2 shadow-[0_20px_44px_-28px_rgba(15,23,42,0.55)] backdrop-blur-md dark:border-white/[0.08] dark:bg-gray-900/[0.94]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <input
          ref={imageUrlInputRef}
          value={imageUrlInput}
          onChange={(event) => onImageUrlInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onSubmitImageUrl()
            }
          }}
          type="url"
          placeholder="粘贴公网图片 URL..."
          className="min-w-0 flex-1 rounded-xl border border-transparent bg-gray-100/90 px-3 py-2 text-sm text-gray-700 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-white/[0.06] dark:text-gray-100 dark:focus:bg-gray-900"
        />
        <button
          type="button"
          onClick={onCancelImageUrl}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
          title="取消"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onSubmitImageUrl}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-600"
          title="添加 URL"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-4-4 4 4-4 4" />
          </svg>
        </button>
      </div>
      <p className="px-1 pt-2 text-[11px] text-gray-400 dark:text-gray-500">
        不会占用下方高度，支持直接粘贴公网图片地址
      </p>
    </div>
  )
}
