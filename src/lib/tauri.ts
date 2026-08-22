/**
 * ============================================================
 * Tauri 运行时集成
 * ============================================================
 * 用途：
 *  - 当应用以 Tauri 桌面壳（Windows .exe / macOS .app / Linux）运行时，
 *    系统 webview 中的 fetch 到外部生图 API 上游会受到 CORS 限制。
 *  - 本模块通过 `@tauri-apps/plugin-http` 的 fetch 替换全局 fetch，
 *    让所有请求经由 Tauri 的 Rust 原生层发出，从而绕过浏览器 CORS。
 *  - 在普通浏览器（npm run dev / 静态服务器）中运行时不做任何替换，
 *    保持原有行为完全不变。
 * ============================================================
 */
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

/** 是否运行在 Tauri 桌面壳中 */
export const IS_TAURI = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/**
 * 在 Tauri 环境下用插件 fetch 替换全局 fetch（一次性幂等）。
 * 返回是否实际进行了替换。
 */
export function setupTauriFetch(): boolean {
  if (!IS_TAURI) return false

  // 防止重复替换
  const g = globalThis as unknown as { __cnbTauriFetchInstalled?: boolean }
  if (g.__cnbTauriFetchInstalled) return true

  const nativeFetch = window.fetch.bind(window)
  const wrapped = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      // 交给 Tauri 插件原生层发起请求，规避 CORS
      return await tauriFetch(input as string, init as Record<string, unknown>)
    } catch (err) {
      // 插件不可用（例如 WebView 未注册 capability）时回退到原生 fetch
      return nativeFetch(input as RequestInfo, init)
    }
  }
  window.fetch = wrapped as typeof fetch
  g.__cnbTauriFetchInstalled = true
  return true
}
