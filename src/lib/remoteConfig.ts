/**
 * ============================================================
 * 远程配置（Cloudflare Pages）客户端
 * ============================================================
 * 说明：
 *  - 当应用部署到 Cloudflare Pages 并配置了环境变量（API_BASE_URL /
 *    API_KEY / API_MODEL / RESPONSES_IMAGE_MODEL / APP_PASSWORD）时，
 *    通过 Pages Function `/_config` 下发远程配置。
 *  - 前端启动时探测 `/_config`，若启用则进入「云端便携版」模式：
 *    任何设备打开网页只需输入同一个登录密码，即可使用云端配置的生图 API，
 *    无需在每台设备上单独配置。
 *  - 未部署 / 未配置环境变量时返回 enabled=false，前端回退到本地配置模式。
 * ============================================================
 */

export interface RemoteConfigMeta {
  enabled: boolean
  baseUrl?: string
  model?: string
  responsesImageModel?: string
}

export interface RemoteLoginResult {
  ok: boolean
  baseUrl?: string
  apiKey?: string
  model?: string
  responsesImageModel?: string
  /** 登录成功后下发的签名会话 token（用于免密续期登录态） */
  token?: string
  /** 会话有效期（天） */
  sessionTtlDays?: number
}

const CONFIG_ENDPOINT = '/_config'
const CONFIG_SESSION_ENDPOINT = '/_config/session'
/** localStorage 中保存会话 token 的键（只存 token，不存密码） */
export const REMOTE_SESSION_TOKEN_KEY = 'gpt-image-playground.remote-session-token'

/** 保存云端会话 token（供后续自动续期解锁） */
export function saveRemoteSessionToken(token: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REMOTE_SESSION_TOKEN_KEY, token)
}

/** 读取本地保存的云端会话 token；不存在返回 null */
export function readRemoteSessionToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REMOTE_SESSION_TOKEN_KEY)
}

/** 清除本地保存的云端会话 token */
export function clearRemoteSessionToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(REMOTE_SESSION_TOKEN_KEY)
}

/** 探测远程配置是否启用（失败视为未启用，不影响本地模式） */
export async function fetchRemoteConfig(): Promise<RemoteConfigMeta> {
  try {
    const response = await fetch(CONFIG_ENDPOINT, {
      headers: { accept: 'application/json' },
    })
    if (!response.ok) {
      return { enabled: false }
    }
    const data = (await response.json()) as RemoteConfigMeta
    return data
  } catch {
    return { enabled: false }
  }
}

/** 使用登录密码换取云端敏感配置（apiKey 等），密码错误返回 null */
export async function loginRemoteConfig(password: string): Promise<RemoteLoginResult | null> {
  try {
    const response = await fetch(CONFIG_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (response.status === 401) {
      return null
    }
    if (!response.ok) {
      return null
    }
    return (await response.json()) as RemoteLoginResult
  } catch {
    return null
  }
}

/** 用会话 token 免密换取云端配置；token 无效 / 已过期返回 null */
export async function refreshRemoteConfig(token: string): Promise<RemoteLoginResult | null> {
  try {
    const response = await fetch(CONFIG_SESSION_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (response.status === 401 || !response.ok) {
      return null
    }
    return (await response.json()) as RemoteLoginResult
  } catch {
    return null
  }
}
