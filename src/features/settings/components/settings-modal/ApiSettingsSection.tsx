import type { Dispatch, SetStateAction } from 'react'
import type {
  AppSettings,
  ProviderConfig,
} from '../../../../types'
import type { DevProxyConfig } from '../../../../lib/devProxy'
import ApiConnectionFields from './ApiConnectionFields'
import ApiModelSettings from './ApiModelSettings'
import ApiProviderFields from './ApiProviderFields'
import ApiRequestSettings from './ApiRequestSettings'
import ApiResponsesSettings from './ApiResponsesSettings'
import ApiTimeoutField from './ApiTimeoutField'

interface ApiSettingsSectionProps {
  draft: AppSettings
  setDraft: Dispatch<SetStateAction<AppSettings>>
  timeoutInput: string
  setTimeoutInput: Dispatch<SetStateAction<string>>
  showApiKey: boolean
  setShowApiKey: Dispatch<SetStateAction<boolean>>
  providerNameInput: string
  setProviderNameInput: Dispatch<SetStateAction<string>>
  providers: ProviderConfig[]
  activeProviderId: string
  proxyConfig: DevProxyConfig | null
  commitSettings: (nextDraft: AppSettings) => void
  commitProviderName: () => void
  commitTimeout: () => void
  flushDraft: () => void
  onActiveProviderChange: (providerId: string) => void
  onCreateProvider: () => void
  onRequestRemoveProvider: () => void
}

export default function ApiSettingsSection({
  draft,
  setDraft,
  timeoutInput,
  setTimeoutInput,
  showApiKey,
  setShowApiKey,
  providerNameInput,
  setProviderNameInput,
  providers,
  activeProviderId,
  proxyConfig,
  commitSettings,
  commitProviderName,
  commitTimeout,
  flushDraft,
  onActiveProviderChange,
  onCreateProvider,
  onRequestRemoveProvider,
}: ApiSettingsSectionProps) {
  return (
    <section>
      <h4 className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        API 配置
      </h4>

      <div className="space-y-4">
        <ApiProviderFields
          providerNameInput={providerNameInput}
          setProviderNameInput={setProviderNameInput}
          providers={providers}
          activeProviderId={activeProviderId}
          flushDraft={flushDraft}
          onActiveProviderChange={onActiveProviderChange}
          onCreateProvider={onCreateProvider}
          onRequestRemoveProvider={onRequestRemoveProvider}
          commitProviderName={commitProviderName}
        />

        <ApiConnectionFields
          draft={draft}
          setDraft={setDraft}
          showApiKey={showApiKey}
          setShowApiKey={setShowApiKey}
          commitSettings={commitSettings}
        />

        <ApiRequestSettings
          draft={draft}
          proxyConfig={proxyConfig}
          commitSettings={commitSettings}
        />

        <ApiModelSettings
          draft={draft}
          setDraft={setDraft}
          commitSettings={commitSettings}
        />

        <ApiResponsesSettings
          draft={draft}
          commitSettings={commitSettings}
        />

        <ApiTimeoutField
          timeoutInput={timeoutInput}
          setTimeoutInput={setTimeoutInput}
          commitTimeout={commitTimeout}
        />
      </div>
    </section>
  )
}
