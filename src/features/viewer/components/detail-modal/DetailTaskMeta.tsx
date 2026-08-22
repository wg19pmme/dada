import { formatElapsedDuration, formatLocaleTime } from './shared'

interface DetailTaskMetaProps {
  createdAt: number
  elapsed: number | null
  inRecycleBin: boolean
  deletedAt: number | null | undefined
  cleanupDueAt: number | null
}

export default function DetailTaskMeta(props: DetailTaskMetaProps) {
  const { createdAt, elapsed, inRecycleBin, deletedAt, cleanupDueAt } = props
  const durationLabel = formatElapsedDuration(elapsed)

  return (
    <div className="mb-4 text-xs text-gray-400 dark:text-gray-500">
      <span>创建于 {formatLocaleTime(createdAt)}</span>
      {durationLabel && <span> · 耗时 {durationLabel}</span>}
      {inRecycleBin && deletedAt ? (
        <>
          <br />
          <span>移入回收站于 {formatLocaleTime(deletedAt)}</span>
          {cleanupDueAt ? <span> · 预计清理于 {formatLocaleTime(cleanupDueAt)}</span> : null}
        </>
      ) : null}
    </div>
  )
}
