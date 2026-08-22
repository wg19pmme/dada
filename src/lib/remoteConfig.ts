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
}

const CONFIG_ENDPOINT = '/_config'

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
