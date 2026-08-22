export interface ImageThumbnailResult {
  width: number
  height: number
  thumbnailBlob: Blob
  thumbnailMimeType: string
  thumbnailWidth: number
  thumbnailHeight: number
}

interface CanvasImageSourceHandle {
  source: CanvasImageSource
  width: number
  height: number
  release: () => void
}

const DEFAULT_THUMBNAIL_MAX_EDGE = 320
const DEFAULT_THUMBNAIL_QUALITY = 0.74

async function loadCanvasImageSource(blob: Blob): Promise<CanvasImageSourceHandle> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob)
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      }
    } catch {
      // 某些浏览器/格式会拒绝 createImageBitmap，这里回退到 <img> 解码。
    }
  }

  const objectUrl = URL.createObjectURL(blob)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('图片解码失败，无法生成缩略图'))
      element.src = objectUrl
    })

    return {
      source: image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      release: () => {
        URL.revokeObjectURL(objectUrl)
      },
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

function resolveThumbnailSize(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const largestEdge = Math.max(width, height)
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('图片尺寸无效，无法生成缩略图')
  }

  if (largestEdge <= maxEdge) {
    return { width, height }
  }

  const scale = maxEdge / largestEdge
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob | null> {
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality)
  })
}

export async function buildImageThumbnail(
  blob: Blob,
  options?: {
    maxEdge?: number
    preferredMimeType?: string
    quality?: number
  },
): Promise<ImageThumbnailResult> {
  if (!(blob instanceof Blob)) {
    throw new Error('buildImageThumbnail 仅支持 Blob 输入')
  }

  const handle = await loadCanvasImageSource(blob)
  try {
    const width = handle.width
    const height = handle.height
    const maxEdge = options?.maxEdge ?? DEFAULT_THUMBNAIL_MAX_EDGE
    const quality = options?.quality ?? DEFAULT_THUMBNAIL_QUALITY
    const thumbnailSize = resolveThumbnailSize(width, height, maxEdge)
    const canvas = document.createElement('canvas')
    canvas.width = thumbnailSize.width
    canvas.height = thumbnailSize.height

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('浏览器不支持 2D Canvas，无法生成缩略图')
    }

    context.drawImage(handle.source, 0, 0, thumbnailSize.width, thumbnailSize.height)

    const preferredMimeType = options?.preferredMimeType ?? 'image/webp'
    const preferredBlob = await canvasToBlob(canvas, preferredMimeType, quality)
    const thumbnailBlob = preferredBlob ?? (await canvasToBlob(canvas, 'image/png'))
    if (!thumbnailBlob) {
      throw new Error('Canvas 导出缩略图失败')
    }

    return {
      width,
      height,
      thumbnailBlob,
      thumbnailMimeType: thumbnailBlob.type || (preferredBlob ? preferredMimeType : 'image/png'),
      thumbnailWidth: thumbnailSize.width,
      thumbnailHeight: thumbnailSize.height,
    }
  } finally {
    handle.release()
  }
}
