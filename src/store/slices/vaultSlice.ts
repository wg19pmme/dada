import type { AppSettings } from '../../types'
import type { AppState, VaultSnapshot } from '../contracts'
import {
  decryptVault,
  encryptVault,
  readVaultPayload,
  writeVaultPayload,
} from '../../lib/vault'
import { fetchRemoteConfig, loginRemoteConfig } from '../../lib/remoteConfig'
import { useStore } from '../state'

/**
 * 当前会话的访问密码（仅存于内存，不落盘；关闭标签页/刷新即失效）。
 * 用于解锁后对修改过的配置重新加密落盘。
 */
let sessionPassword: string | null = null

/** 构造一个锁定态快照：仅保留默认非敏感设置，apiKey 强制清空 */
function createLockedSnapshot(currentState: AppState): VaultSnapshot {
  return {
    settings: { ...currentState.settings, apiKey: '' },
    providers: currentState.providers.map((provider) => ({ ...provider, apiKey: '' })),
    activeProviderId: currentState.activeProviderId,
  }
}

/** 应用已解密出的敏感配置快照到 store */
function applySnapshot(set: any, snapshot: VaultSnapshot) {
  set((state: AppState) => ({
    settings: snapshot.settings,
    providers: snapshot.providers,
    activeProviderId: snapshot.activeProviderId,
    unlocked: true,
  }))
}

/** 将当前状态锁定（清空内存中的敏感配置与会话密码） */
function lockState(set: any) {
  set((state: AppState) => {
    const locked = createLockedSnapshot(state)
    return {
      ...state,
      settings: locked.settings,
      providers: locked.providers,
      activeProviderId: locked.activeProviderId,
      unlocked: false,
    }
  })
}

/** 从当前 state 读取敏感配置快照 */
function buildSnapshotFromState(state: AppState): VaultSnapshot {
  return {
    settings: state.settings,
    providers: state.providers,
    activeProviderId: state.activeProviderId,
  }
}

export function createVaultSlice(set: any) {
  return {
    unlocked: false,

    setUnlocked(unlocked: boolean) {
      set({ unlocked })
    },

    /** 首次使用：设置密码并加密保存敏感配置 */
    async setupVault(password: string, snapshot: VaultSnapshot) {
      if (!password) {
        throw new Error('密码不能为空')
      }
      const payload = await encryptVault(snapshot, password)
      writeVaultPayload(payload)
      sessionPassword = password
      applySnapshot(set, snapshot)
    },

    /** 用当前会话密码加密保存配置快照 */
    async saveVault(snapshot: VaultSnapshot) {
      if (!sessionPassword) {
        throw new Error('当前会话未解锁，无法保存')
      }
      const payload = await encryptVault(snapshot, sessionPassword)
      writeVaultPayload(payload)
      applySnapshot(set, snapshot)
    },

    /** 用当前会话密码把 store 中的最新配置加密落盘 */
    async commitVault() {
      if (!sessionPassword) {
        throw new Error('当前会话未解锁，无法保存')
      }
      const state = useStore.getState() as AppState
      const payload = await encryptVault(buildSnapshotFromState(state), sessionPassword)
      writeVaultPayload(payload)
    },

    /** 用密码解锁保险库；密码错误返回 false */
    async unlockVault(password: string): Promise<boolean> {
      const payload = readVaultPayload()
      if (!payload) {
        return false
      }
      try {
        const snapshot = await decryptVault<VaultSnapshot>(payload, password)
        sessionPassword = password
        applySnapshot(set, snapshot)
        return true
      } catch {
        return false
      }
    },

    /** 锁定保险库：清空内存敏感配置与会话密码 */
    lockVault() {
      sessionPassword = null
      lockState(set)
    },

    /** 修改密码：校验旧密码后，用新密码重新加密落盘 */
    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
      const payload = readVaultPayload()
      if (!payload) return false
      try {
        const snapshot = await decryptVault<VaultSnapshot>(payload, oldPassword)
        if (!newPassword) {
          throw new Error('新密码不能为空')
        }
        const newPayload = await encryptVault(snapshot, newPassword)
        writeVaultPayload(newPayload)
        sessionPassword = newPassword
        return true
      } catch {
        return false
      }
    },

    /** 云端便携版：是否启用了远程配置 */
    remoteEnabled: false,

    /** 云端便携版：探测远程配置；启用则返回 true */
    async initRemoteConfig(): Promise<boolean> {
      const config = await fetchRemoteConfig()
      set({ remoteEnabled: config.enabled })
      return config.enabled
    },

    /** 云端便携版：用登录密码换取云端配置；密码错误返回 false */
    async loginRemote(password: string): Promise<boolean> {
      if (!password) return false
      const result = await loginRemoteConfig(password)
      if (!result || !result.ok || !result.baseUrl) {
        return false
      }
      sessionPassword = null
      const remoteOverrides: Partial<AppSettings> = {
        baseUrl: result.baseUrl,
        apiKey: result.apiKey ?? '',
        model: result.model ?? '',
        responsesImageModel: result.responsesImageModel ?? result.model ?? '',
      }
      set((state: AppState) => {
        const nextSettings = {
          ...state.settings,
          ...remoteOverrides,
        }
        return {
          settings: nextSettings,
          providers: state.providers.map((provider) =>
            provider.id === state.activeProviderId
              ? { ...provider, ...remoteOverrides }
              : provider,
          ),
          unlocked: true,
        }
      })
      return true
    },

    /** 云端便携版：锁定（清空内存中的云端 apiKey） */
    lockRemote() {
      sessionPassword = null
      lockState(set)
    },
  }
}
