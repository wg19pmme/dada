export const API_MAX_IMAGES = 16

export function isRemotePreviewUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}
