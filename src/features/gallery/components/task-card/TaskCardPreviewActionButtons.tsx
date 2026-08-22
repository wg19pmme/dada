interface TaskCardPreviewActionButtonsProps {
  isInRecycleBin: boolean
  isFavorite: boolean
  selected: boolean
  touchActionsVisible: boolean
  onToggleFavorite: () => void
  onToggleSelect: () => void
  onHideTouchActions: () => void
}

export default function TaskCardPreviewActionButtons({
  isInRecycleBin,
  isFavorite,
  selected,
  touchActionsVisible,
  onToggleFavorite,
  onToggleSelect,
  onHideTouchActions,
}: TaskCardPreviewActionButtonsProps) {
  const hiddenActionClass =
    'pointer-events-none translate-y-1 opacity-0 group-hover/task-card:pointer-events-auto group-hover/task-card:translate-y-0 group-hover/task-card:opacity-100'
  const favoriteButtonVisibilityClass =
    isFavorite || touchActionsVisible
      ? 'pointer-events-auto translate-y-0 opacity-100'
      : hiddenActionClass
  const selectButtonVisibilityClass =
    selected || touchActionsVisible
      ? 'pointer-events-auto translate-y-0 opacity-100'
      : hiddenActionClass

  return (
    <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
      {!isInRecycleBin && (
        <button
          type="button"
          className={`flex h-7 w-7 items-center justify-center rounded-xl border shadow-[0_8px_18px_-12px_rgba(15,23,42,0.6)] backdrop-blur-md transition-all duration-200 ${favoriteButtonVisibilityClass} ${
            isFavorite
              ? 'border-amber-400/70 bg-amber-400 text-white'
              : 'border-white/60 bg-white/[0.78] text-gray-400 hover:-translate-y-px hover:border-amber-300/70 hover:bg-white hover:text-amber-400 dark:border-white/10 dark:bg-black/[0.35] dark:text-gray-500 dark:hover:border-amber-400/40 dark:hover:bg-black/50 dark:hover:text-amber-300'
          }`}
          onClick={(event) => {
            event.stopPropagation()
            onHideTouchActions()
            onToggleFavorite()
          }}
          title={isFavorite ? '取消收藏' : '加入收藏'}
          aria-label={isFavorite ? '取消收藏' : '加入收藏'}
        >
          <svg
            className="h-3.5 w-3.5"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={isFavorite ? 0 : 2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.049 2.927 2.037 4.128 4.556.663-3.297 3.213.778 4.538L11.05 13.33 6.978 15.47l.778-4.538-3.297-3.213 4.556-.663 2.034-4.128Z"
            />
          </svg>
        </button>
      )}

      <button
        type="button"
        className={`flex h-7 w-7 items-center justify-center rounded-xl border shadow-[0_8px_18px_-12px_rgba(15,23,42,0.6)] backdrop-blur-md transition-all duration-200 ${selectButtonVisibilityClass} ${
          selected
            ? 'border-blue-500/70 bg-blue-500 text-white'
            : 'border-white/60 bg-white/[0.78] text-gray-400 hover:-translate-y-px hover:border-blue-300/70 hover:bg-white hover:text-blue-400 dark:border-white/10 dark:bg-black/[0.35] dark:text-gray-500 dark:hover:border-blue-400/40 dark:hover:bg-black/50 dark:hover:text-blue-300'
        }`}
        onClick={(event) => {
          event.stopPropagation()
          onHideTouchActions()
          onToggleSelect()
        }}
        title={selected ? '取消选择' : '选择任务'}
        aria-label={selected ? '取消选择' : '选择任务'}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  )
}
