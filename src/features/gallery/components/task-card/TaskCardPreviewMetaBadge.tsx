import type { TaskRecord } from '../../../../types'

interface TaskCardPreviewMetaBadgeProps {
  task: TaskRecord
  coverRatio: string
  coverSize: string
  duration: string
}

export default function TaskCardPreviewMetaBadge({
  task,
  coverRatio,
  coverSize,
  duration,
}: TaskCardPreviewMetaBadgeProps) {
  if (task.status !== 'done' || !coverRatio || !coverSize) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-black/[0.55] px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur-sm">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {duration}
      </span>
    )
  }

  return (
    <>
      <span className="rounded-full bg-black/[0.55] px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur-sm">
        {coverRatio}
      </span>
      <span className="rounded-full bg-black/[0.55] px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
        {coverSize}
      </span>
    </>
  )
}
