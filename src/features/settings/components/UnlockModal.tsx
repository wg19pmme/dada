import { useEffect, useState } from 'react'
import { useStore } from '../../../store'
import { isVaultConfigured } from '../../../lib/vault'

/**
 * 密码解锁门禁：当本地已存在加密保险库但当前会话未解锁时，全屏拦截。
 * 只有输入正确密码解锁后，才可进入应用使用。
 */
export default function UnlockModal() {
  const unlocked = useStore((s) => s.unlocked)
  const unlockVault = useStore((s) => s.unlockVault)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const configured = isVaultConfigured()
  const locked = configured && !unlocked

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
    const ok = await unlockVault(password)
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
          请输入访问密码解锁，才能使用生图 API 配置
        </p>
        <form onSubmit={handleUnlock} className="mt-5 space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="访问密码"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!password || busy}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? '解锁中…' : '解锁'}
          </button>
        </form>
      </div>
    </div>
  )
}
