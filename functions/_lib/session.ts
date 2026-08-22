/**
 * ============================================================
 * 会话 token 工具（供 /_config 与 /_config/session 复用）
 * ============================================================
 * 生成 / 校验带过期时间的签名 token，让「云端便携版」登录态可以保持多天，
 * 而不是每次刷新 / 重新打开页面就要求重新输入登录密码。
 *
 * token 结构：<base64Url(exp)>. <hmac>
 *   - exp  ：过期时间戳（毫秒），base64 编码
 *   - hmac ：以 APP_PASSWORD 为密钥对 payload 做 HMAC-SHA256 签名（hex）
 *
 * 有效期：默认 30 天，可用环境变量 REMOTE_SESSION_TTL_DAYS 覆盖。
 * ============================================================
 */

/** 会话 token 默认有效期（天），可用环境变量 REMOTE_SESSION_TTL_DAYS 覆盖 */
export const DEFAULT_SESSION_TTL_DAYS = 30

interface EnvLike {
  APP_PASSWORD?: string
  REMOTE_SESSION_TTL_DAYS?: string
}

/** 解析会话有效期天数；非法值回退默认 */
export function resolveSessionTtl(env: EnvLike): number {
  const raw = env.REMOTE_SESSION_TTL_DAYS
  if (!raw) return DEFAULT_SESSION_TTL_DAYS
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_SESSION_TTL_DAYS
}

/** 用 APP_PASSWORD 对 payload 做 HMAC-SHA256 签名，返回 hex 字符串 */
function signHmac(secret: string, payload: string): Promise<string> {
  const key = new TextEncoder().encode(secret)
  const data = new TextEncoder().encode(payload)
  // Cloudflare Workers 运行时提供 globalThis.crypto.subtle
  return globalThis.crypto.subtle
    .importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then((cryptoKey) => globalThis.crypto.subtle.sign('HMAC', cryptoKey, data))
    .then((sig) =>
      Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    )
}

/** 常数时间比较两个等长字符串，防时序攻击 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/** 签发签名会话 token；未配置 APP_PASSWORD 时返回 null */
export async function buildSessionToken(
  env: EnvLike,
  ttlDays: number,
): Promise<string | null> {
  const secret = env.APP_PASSWORD
  if (!secret) return null
  const expires = Date.now() + ttlDays * 24 * 60 * 60 * 1000
  const payload = btoa(String(expires))
  const mac = await signHmac(secret, payload)
  return `${payload}.${mac}`
}

/** 校验会话 token；有效且未过期返回 true */
export async function verifySessionToken(env: EnvLike, token: string): Promise<boolean> {
  const secret = env.APP_PASSWORD
  if (!secret) return false
  const idx = token.lastIndexOf('.')
  if (idx <= 0) return false
  const payload = token.slice(0, idx)
  const mac = token.slice(idx + 1)
  if (!payload || !mac) return false
  const expectMac = await signHmac(secret, payload)
  if (mac.length !== expectMac.length || !timingSafeEqual(mac, expectMac)) {
    return false
  }
  const expires = Number(atob(payload))
  if (!Number.isFinite(expires) || expires <= Date.now()) return false
  return true
}
