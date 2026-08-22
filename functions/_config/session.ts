/**
 * ============================================================
 * Cloudflare Pages Function —— 会话 token 免密续期
 * ============================================================
 * 路由：POST /_config/session，body: { token }
 *
 * 前端在刷新 / 重新打开页面时，携带登录成功后保存的会话 token 请求此接口：
 *  - token 有效且未过期：返回云端配置（apiKey 等），并签发新 token 续期，
 *    前端自动解锁，无需再次输入登录密码。
 *  - token 无效 / 已过期：返回 401，前端清空本地 token 并弹出登录框。
 * ============================================================
 */

import {
  buildSessionToken,
  resolveSessionTtl,
  verifySessionToken,
} from '../_lib/session'

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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isRemoteEnabled(env)) {
    return json({ error: 'remote_config_not_configured' }, 404)
  }
  if (!env.APP_PASSWORD) {
    return json({ error: 'app_password_not_configured' }, 500)
  }

  let body: { token?: unknown }
  try {
    body = (await request.json()) as { token?: unknown }
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (typeof body.token !== 'string' || body.token === '') {
    return json({ error: 'missing_token' }, 400)
  }

  const valid = await verifySessionToken(env, body.token)
  if (!valid) {
    return json({ error: 'invalid_session' }, 401)
  }

  // 续期：签发新 token，避免每次刷新都缩短剩余时长
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
