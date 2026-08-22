interface DetailInputImagesSectionProps {
  imageIds: string[]
  imageSrcs: Record<string, string>
  onCopyInputImage: () => void
  onOpenInputImage: (imageId: string) => void
}

export default function DetailInputImagesSection(props: DetailInputImagesSectionProps) {
  const { imageIds, imageSrcs, onCopyInputImage, onOpenInputImage } = props

  if (imageIds.length === 0) return null

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-1.5">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          参考图
        </h3>
        <button
          type="button"
          onClick={onCopyInputImage}
          className="rounded p-1 text-gray-400 transition hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-white/[0.06]"
          title="复制参考图"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {imageIds.map((imageId) => {
          const src = imageSrcs[imageId]
          if (!src) return null

          return (
            <img
              key={imageId}
              src={src}
              className="h-16 w-16 cursor-pointer rounded-lg border border-gray-200 object-cover transition hover:opacity-80 dark:border-white/[0.08]"
              onClick={() => onOpenInputImage(imageId)}
              alt=""
            />
          )
        })}
      </div>
    </div>
  )
}
