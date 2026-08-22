import { useEffect, useState } from 'react'
import { useStore } from '../../../store'
import { isVaultConfigured } from '../../../lib/vault'

/**
 * 密码解锁门禁：当应用需要解锁时全屏拦截。
 * - 云端便携版（已启用 Cloudflare Pages 远程配置）：输入网页端登录密码，
 *   密码正确后从云端下发生图 API 配置（地址 / key / 模型），任何设备输入同一个密码即可使用。
 * - 本地版：输入本地保险库密码解锁本地加密保存的配置。
 */
export default function UnlockModal() {
  const unlocked = useStore((s) => s.unlocked)
  const remoteEnabled = useStore((s) => s.remoteEnabled)
  const unlockVault = useStore((s) => s.unlockVault)
  const loginRemote = useStore((s) => s.loginRemote)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const vaultConfigured = isVaultConfigured()
  // 云端便携版：远程配置启用时，直接要求登录（无视本地 vault）
  const locked = remoteEnabled ? !unlocked : vaultConfigured && !unlocked

  useEffect(() => {
    if (!locked) {
      setPassword('')
      setError('')
      setBusy(false)
    }
  }, [locked])

  if (!locked) return null

  const handleUnlock = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError('')
    let ok: boolean
    if (remoteEnabled) {
      ok = await loginRemote(password)
    } else {
      ok = await unlockVault(password)
    }
    setBusy(false)
    if (!ok) {
      setPassword('')
      setError('密码不正确，请重试')
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xl dark:border-white/[0.08] dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-center text-lg font-semibold text-gray-800 dark:text-gray-100">已锁定</h2>
        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          {remoteEnabled
            ? '请输入网页端登录密码，解锁云端生图 API 配置'
            : '请输入访问密码解锁，才能使用生图 API 配置'}
        </p>
        <form onSubmit={handleUnlock} className="mt-5 space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="登录密码"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!password || busy}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
