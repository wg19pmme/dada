/**
 * ============================================================
 * Cloudflare Pages Function —— 远程配置 / 登录
 * ============================================================
 * 说明：
 *  - 供「云端便携版」使用：把生图 API 上游接口（地址 / key / 模型）
 *    以及网页端登录密码直接配置在 Cloudflare Pages 的环境变量里，
 *    这样任何设备打开网页，输入同一个登录密码即可使用，无需每台单独配置。
 *
 * 需要在 Cloudflare Pages → Settings → Environment variables 配置：
 *   - API_BASE_URL       生图 API 上游接口地址（如 https://api.openai.com）
 *   - API_MODEL          Images API 模型（如 gpt-image-2）
 *   - RESPONSES_IMAGE_MODEL  Responses API 图片模型（可留空，默认取 API_MODEL）
 *   - API_KEY            上游接口的 API Key（仅存在服务端，不在前端暴露）
 *   - APP_PASSWORD       网页端登录密码（仅存在服务端，用于校验后下发 apiKey）
 *   - REMOTE_SESSION_TTL_DAYS  登录态有效期（天，可选，默认 30）
 *
 * 路由约定：
 *   GET  /_config           探测远程配置是否启用，返回非敏感字段
 *   POST /_config/login     提交登录密码，正确则下发 apiKey 等敏感配置
 *                           （并签发一个带过期时间的签名会话 token，见 /_config/session）
 *   POST /_config/session   携带会话 token，未过期则下发云端配置（用于免密续期会话）
 *
 * 登录态保持：
 *   - 登录成功后签发一个 HMAC 签名 token（默认有效期 REMOTE_SESSION_TTL_DAYS 天，默认 30 天），
 *     前端存到 localStorage；之后刷新 / 重新打开页面时用该 token 自动换取配置，无需重复输入密码。
 *   - token 过期后服务端拒绝，前端才会再次弹出登录框。
 * ============================================================
 */

import {
  buildSessionToken,
  resolveSessionTtl,
} from './_lib/session'

interface Env {
  API_BASE_URL?: string
  API_MODEL?: string
  RESPONSES_IMAGE_MODEL?: string
  API_KEY?: string
  APP_PASSWORD?: string
  REMOTE_SESSION_TTL_DAYS?: string
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function isRemoteEnabled(env: Env): boolean {
  return Boolean(env.API_BASE_URL && env.API_MODEL)
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!isRemoteEnabled(env)) {
    return json({ enabled: false })
  }
  return json({
    enabled: true,
    baseUrl: env.API_BASE_URL,
    model: env.API_MODEL,
    responsesImageModel: env.RESPONSES_IMAGE_MODEL || env.API_MODEL,
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isRemoteEnabled(env)) {
    return json({ error: 'remote_config_not_configured' }, 404)
  }
  if (!env.APP_PASSWORD) {
    return json({ error: 'app_password_not_configured' }, 500)
  }

  let body: { password?: unknown }
  try {
    body = (await request.json()) as { password?: unknown }
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (typeof body.password !== 'string' || body.password === '') {
    return json({ error: 'missing_password' }, 400)
  }

  if (body.password !== env.APP_PASSWORD) {
    return json({ error: 'invalid_password' }, 401)
  }

  const ttlDays = resolveSessionTtl(env)
  const token = await buildSessionToken(env, ttlDays)

  return json({
    ok: true,
    baseUrl: env.API_BASE_URL,
    apiKey: env.API_KEY || '',
    model: env.API_MODEL,
    responsesImageModel: env.RESPONSES_IMAGE_MODEL || env.API_MODEL,
    token: token || undefined,
    sessionTtlDays: ttlDays,
  })
}
