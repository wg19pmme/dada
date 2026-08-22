import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeBaseUrl, readClientDevProxyConfig } from '../../../../lib/devProxy'
import { useStore, exportData, importData, clearAllData } from '../../../../store'
import { DEFAULT_SETTINGS, type AppSettings } from '../../../../types'
import { isVaultConfigured } from '../../../../lib/vault'
import { useCloseOnEscape } from '../../../../hooks/useCloseOnEscape'
import ApiSettingsSection from './ApiSettingsSection'
import DataManagementSection from './DataManagementSection'

function normalizeRuntimeRequestMode(requestMode: AppSettings['requestMode']): AppSettings['requestMode'] {
  return import.meta.env.DEV && requestMode === 'local_proxy' ? 'local_proxy' : 'direct'
}

function normalizeSettingsDraft(settings: AppSettings): AppSettings {
  return {
    ...settings,
    requestMode: normalizeRuntimeRequestMode(settings.requestMode),
  }
}

export default function SettingsModal() {
  const showSettings = useStore((s) => s.showSettings)
  const setShowSettings = useStore((s) => s.setShowSettings)
  const settings = useStore((s) => s.settings)
  const providers = useStore((s) => s.providers)
  const activeProviderId = useStore((s) => s.activeProviderId)
  const setSettings = useStore((s) => s.setSettings)
  const setActiveProvider = useStore((s) => s.setActiveProvider)
  const createProvider = useStore((s) => s.createProvider)
  const updateProviderName = useStore((s) => s.updateProviderName)
  const removeProvider = useStore((s) => s.removeProvider)
  const setConfirmDialog = useStore((s) => s.setConfirmDialog)
  const setupVault = useStore((s) => s.setupVault)
  const commitVault = useStore((s) => s.commitVault)
  const lockVault = useStore((s) => s.lockVault)
  const lockRemote = useStore((s) => s.lockRemote)
  const changePassword = useStore((s) => s.changePassword)
  const remoteEnabled = useStore((s) => s.remoteEnabled)

  const importInputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<AppSettings>(() => normalizeSettingsDraft(settings))
  const [timeoutInput, setTimeoutInput] = useState(String(settings.timeout))
  const [showApiKey, setShowApiKey] = useState(false)
  const [providerNameInput, setProviderNameInput] = useState('')

  // 首次使用（未设置密码）时先引导设置访问密码
  const [setupPassword, setSetupPassword] = useState('')
  const [setupPasswordConfirm, setSetupPasswordConfirm] = useState('')
  const [setupError, setSetupError] = useState('')
  const [setupBusy, setSetupBusy] = useState(false)

  // 修改密码弹层
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changeError, setChangeError] = useState('')

  const proxyConfig = readClientDevProxyConfig()
  const activeProvider = providers.find((provider) => provider.id === activeProviderId) ?? null
  const needsSetup = showSettings && !remoteEnabled && !isVaultConfigured()

  useEffect(() => {
    if (!showSettings) return
    setDraft(normalizeSettingsDraft(settings))
    setTimeoutInput(String(settings.timeout))
    setProviderNameInput(activeProvider?.name ?? '')
  }, [activeProvider, settings, showSettings])

  const commitSettings = useCallback(
    (nextDraft: AppSettings) => {
      const normalizedDraft = {
        ...nextDraft,
        baseUrl: normalizeBaseUrl(nextDraft.baseUrl.trim() || DEFAULT_SETTINGS.baseUrl),
        apiKey: nextDraft.apiKey,
        model: nextDraft.model.trim() || DEFAULT_SETTINGS.model,
        responsesImageModel:
          nextDraft.responsesImageModel.trim() || DEFAULT_SETTINGS.responsesImageModel,
        responsesTransport: nextDraft.responsesTransport || DEFAULT_SETTINGS.responsesTransport,
        responsesImageInputMode:
          nextDraft.responsesImageInputMode || DEFAULT_SETTINGS.responsesImageInputMode,
        responsesPromptRevisionMode:
          nextDraft.responsesPromptRevisionMode || DEFAULT_SETTINGS.responsesPromptRevisionMode,
        timeout: Number(nextDraft.timeout) || DEFAULT_SETTINGS.timeout,
        apiProtocol: nextDraft.apiProtocol || DEFAULT_SETTINGS.apiProtocol,
        requestMode: normalizeRuntimeRequestMode(nextDraft.requestMode || DEFAULT_SETTINGS.requestMode),
      }
      setDraft(normalizedDraft)
      setSettings(normalizedDraft)
    },
    [setSettings],
  )

  const handleClose = useCallback(() => {
    const nextTimeout = Number(timeoutInput)
    commitSettings({
      ...draft,
      timeout:
        timeoutInput.trim() === '' || Number.isNaN(nextTimeout)
          ? DEFAULT_SETTINGS.timeout
          : nextTimeout,
    })
    // 将最新配置加密落盘（云端便携版由云端管理，跳过本地 vault）
    if (!remoteEnabled) {
      void commitVault().catch(() => {})
    }
    setShowSettings(false)
  }, [commitSettings, commitVault, remoteEnabled, draft, setShowSettings, timeoutInput])

  const commitTimeout = useCallback(() => {
    const nextTimeout = Number(timeoutInput)
    const normalizedTimeout =
      timeoutInput.trim() === '' ? DEFAULT_SETTINGS.timeout : Number.isNaN(nextTimeout) ? draft.timeout : nextTimeout
    setTimeoutInput(String(normalizedTimeout))
    commitSettings({ ...draft, timeout: normalizedTimeout })
  }, [commitSettings, draft, timeoutInput])

  const commitProviderName = useCallback(() => {
    if (!activeProvider) return
    const nextName = providerNameInput.trim() || activeProvider.name
    setProviderNameInput(nextName)
    updateProviderName(activeProvider.id, nextName)
  }, [activeProvider, providerNameInput, updateProviderName])

  const flushDraft = useCallback(() => {
    const nextTimeout = Number(timeoutInput)
    const normalizedTimeout =
      timeoutInput.trim() === '' || Number.isNaN(nextTimeout) ? draft.timeout : nextTimeout
    commitSettings({ ...draft, timeout: normalizedTimeout })
    if (activeProvider) {
      const nextName = providerNameInput.trim() || activeProvider.name
      setProviderNameInput(nextName)
      updateProviderName(activeProvider.id, nextName)
    }
  }, [activeProvider, commitSettings, draft, providerNameInput, timeoutInput, updateProviderName])

  useCloseOnEscape(showSettings, handleClose)

  if (!showSettings) return null

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) importData(file)
    event.target.value = ''
  }

  const handleSetupPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (setupBusy) return
    if (setupPassword.length < 4) {
      setSetupError('密码至少 4 位')
      return
    }
    if (setupPassword !== setupPasswordConfirm) {
      setSetupError('两次输入的密码不一致')
      return
    }
    setSetupBusy(true)
    setSetupError('')
    try {
      const normalizedDraft = {
        ...draft,
        requestMode: normalizeRuntimeRequestMode(draft.requestMode),
      }
      await setupVault(setupPassword, {
        settings: normalizedDraft,
        providers,
        activeProviderId,
      })
      setSetupPassword('')
      setSetupPasswordConfirm('')
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : '设置密码失败')
    } finally {
      setSetupBusy(false)
    }
  }

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (newPassword.length < 4) {
      setChangeError('新密码至少 4 位')
      return
    }
    const ok = await changePassword(oldPassword, newPassword)
    if (ok) {
      setShowChangePassword(false)
      setOldPassword('')
      setNewPassword('')
      setChangeError('')
    } else {
      setChangeError('旧密码不正确')
    }
  }

  const handleLock = () => {
    commitSettings({
      ...draft,
      timeout:
        timeoutInput.trim() === '' || Number.isNaN(Number(timeoutInput))
          ? DEFAULT_SETTINGS.timeout
          : Number(timeoutInput),
    })
    if (remoteEnabled) {
      lockRemote()
    } else {
      lockVault()
    }
    setShowSettings(false)
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/50 bg-white/95 shadow-2xl ring-1 ring-black/5 animate-slide-in-right dark:border-white/[0.08] dark:bg-gray-900/95 dark:ring-white/10">
        <div className="sticky top-0 z-10 border-b border-gray-100/80 bg-white/95 px-5 py-5 backdrop-blur-sm dark:border-white/[0.08] dark:bg-gray-900/95">
          <div className="flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </h3>
            <div className="flex items-center gap-3">
              {!needsSetup && (
                <>
                  {!remoteEnabled && (
                    <button
                      onClick={() => {
                        setOldPassword('')
                        setNewPassword('')
                        setChangeError('')
                        setShowChangePassword(true)
                      }}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
                      title="修改访问密码"
                    >
                      改密码
                    </button>
                  )}
                  <button
                    onClick={handleLock}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
                    title="锁定保险库"
                  >
                    锁定
                  </button>
                </>
              )}
              <span className="select-none font-mono text-xs text-gray-400 dark:text-gray-500">v{__APP_VERSION__}</span>
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.06] dark:hover:text-gray-200"
                aria-label="关闭"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {needsSetup ? (
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-6 py-8">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-5 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-center text-lg font-semibold text-gray-800 dark:text-gray-100">设置访问密码</h2>
              <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                密码将用于加密保存生图 API 配置，每次打开应用需输入解锁
              </p>
              <form onSubmit={handleSetupPassword} className="mt-6 space-y-3">
                <input
                  type="password"
                  autoFocus
                  value={setupPassword}
                  onChange={(event) => setSetupPassword(event.target.value)}
                  placeholder="设置访问密码（至少 4 位）"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  type="password"
                  value={setupPasswordConfirm}
                  onChange={(event) => setSetupPasswordConfirm(event.target.value)}
                  placeholder="再次输入密码"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100"
                />
                {setupError && <p className="text-xs text-red-500">{setupError}</p>}
                <button
                  type="submit"
                  disabled={setupBusy}
                  className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {setupBusy ? '保存中…' : '保存并继续'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-5 custom-scrollbar">
            <div className="space-y-6">
              {remoteEnabled ? (
                <div className="rounded-xl border border-blue-200/70 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-blue-700 dark:text-blue-300">云端便携版</p>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        生图 API 地址、Key、模型与登录密码已配置在 Cloudflare Pages 环境变量中，
                        由云端统一管理，无需在此修改。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <ApiSettingsSection
                  draft={draft}
                  setDraft={setDraft}
                  timeoutInput={timeoutInput}
                  setTimeoutInput={setTimeoutInput}
                  showApiKey={showApiKey}
                  setShowApiKey={setShowApiKey}
                  providerNameInput={providerNameInput}
                  setProviderNameInput={setProviderNameInput}
                  providers={providers}
                  activeProviderId={activeProviderId}
                  proxyConfig={proxyConfig}
                  commitSettings={commitSettings}
                  commitProviderName={commitProviderName}
                  commitTimeout={commitTimeout}
                  flushDraft={flushDraft}
                  onActiveProviderChange={setActiveProvider}
                  onCreateProvider={createProvider}
                  onRequestRemoveProvider={() => {
                    if (!activeProvider) return
                    setConfirmDialog({
                      title: '删除GPT-Image2',
                      message: `确定删除GPT-Image2“${activeProvider.name}”吗？`,
                      action: () => removeProvider(activeProvider.id),
                    })
                  }}
                />
              )}

              <DataManagementSection
                importInputRef={importInputRef}
                onImportChange={handleImport}
                onExport={() => exportData()}
                onOpenImport={() => importInputRef.current?.click()}
                onClearAll={() =>
                  setConfirmDialog({
                    title: '清空所有数据',
                    message: '确定要清空所有任务记录和图片数据吗？此操作不可恢复。',
                    action: () => clearAllData(),
                  })
                }
              />
            </div>
          </div>
        )}

        {showChangePassword && !needsSetup && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={handleChangePassword}
              className="w-full max-w-sm rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xl dark:border-white/[0.08] dark:bg-gray-900"
            >
              <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">修改访问密码</h3>
              <div className="space-y-3">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  placeholder="旧密码"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="新密码（至少 4 位）"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100"
                />
                {changeError && <p className="text-xs text-red-500">{changeError}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    确定
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
