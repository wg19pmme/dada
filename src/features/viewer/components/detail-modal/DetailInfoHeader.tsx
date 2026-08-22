interface DetailInfoHeaderProps {
  statusLabel: string
  statusChipClass: string
  progressCountLabel: string | null
  transportLabel: string | null
  transportChipClass: string
  inRecycleBin: boolean
  isFavorite: boolean
  hasPrompt: boolean
  onClose: () => void
  onToggleFavorite: () => void
  onCopyPrompt: () => void
}

export default function DetailInfoHeader(props: DetailInfoHeaderProps) {
  const {
    statusLabel,
    statusChipClass,
    progressCountLabel,
    transportLabel,
    transportChipClass,
    inRecycleBin,
    isFavorite,
    hasPrompt,
    onClose,
    onToggleFavorite,
    onCopyPrompt,
  } = props

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 hidden rounded-full p-1 text-gray-400 transition hover:bg-gray-100 md:block dark:hover:bg-white/[0.06]"
        aria-label="关闭"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="mb-2 flex items-center gap-1.5">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          输入内容
        </h3>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusChipClass}`}>
          {statusLabel}
        </span>
        {progressCountLabel && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
            {progressCountLabel}
          </span>
        )}
        {transportLabel && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${transportChipClass}`}>
            {transportLabel}
          </span>
        )}
        {!inRecycleBin && (
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition ${
              isFavorite
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:bg-white/[0.04] dark:text-gray-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-300'
            }`}
            title={isFavorite ? '取消收藏' : '加入收藏'}
          >
            <svg className="h-3.5 w-3.5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m11.049 2.927 2.037 4.128 4.556.663-3.297 3.213.778 4.538L11.05 13.33 6.978 15.47l.778-4.538-3.297-3.213 4.556-.663 2.034-4.128Z" />
            </svg>
            {isFavorite ? '已收藏' : '收藏'}
          </button>
        )}
        {hasPrompt && (
          <button
            type="button"
            onClick={onCopyPrompt}
            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-white/[0.06]"
            title="复制提示词"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
    </>
  )
}
