import { useStore } from './state'

function normalizeImageIdList(imageId: string, imageIds?: string[]): string[] {
  const normalizedImageId = typeof imageId === 'string' ? imageId.trim() : ''
  const normalizedList = Array.from(
    new Set(
      (imageIds ?? [])
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean),
    ),
  )

  if (!normalizedImageId) {
    return normalizedList
  }

  if (normalizedList.includes(normalizedImageId)) {
    return normalizedList
  }

  return [normalizedImageId, ...normalizedList]
}

export function openLightbox(imageId: string, imageIds?: string[]) {
  const normalizedList = normalizeImageIdList(imageId, imageIds)
  const normalizedImageId = typeof imageId === 'string' ? imageId.trim() : ''
  const normalizedId = normalizedList.includes(normalizedImageId)
    ? normalizedImageId
    : normalizedList[0] ?? null

  useStore.getState().setLightboxImageId(normalizedId, normalizedList)
}

export function closeLightbox() {
  useStore.getState().setLightboxImageId(null)
}
