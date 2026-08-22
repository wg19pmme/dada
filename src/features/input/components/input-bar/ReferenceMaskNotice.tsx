interface ReferenceMaskNoticeProps {
  maskedInputCount: number
  canEditMask: boolean
  onReopenMaskedEdit: () => void
  onClearMaskedEdit: () => void
}

export default function ReferenceMaskNotice({
  maskedInputCount,
  canEditMask,
  onReopenMaskedEdit,
  onClearMaskedEdit,
}: ReferenceMaskNoticeProps) {
  if (maskedInputCount <= 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 text-xs text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
      <div className="flex flex-col gap-2">
        <div>包含 {maskedInputCount} 张带蒙版的局部编辑参考图。</div>
        {canEditMask && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={onReopenMaskedEdit}
              className="rounded-lg border border-emerald-300/80 bg-white/80 px-2 py-1 text-[10px] font-medium text-emerald-700 transition hover:bg-white dark:border-emerald-400/20 dark:bg-white/[0.06] dark:text-emerald-200 dark:hover:bg-white/[0.1]"
            >
              调整选区
            </button>
            <button
              type="button"
              onClick={onClearMaskedEdit}
              className="rounded-lg border border-emerald-300/60 px-2 py-1 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-100/80 dark:border-emerald-400/20 dark:text-emerald-200 dark:hover:bg-emerald-400/10"
            >
              清除蒙版
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
