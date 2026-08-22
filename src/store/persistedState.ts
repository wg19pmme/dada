import type { AppView, GalleryDisplayMode } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import type { AppState, PersistedAppStateSnapshot } from './contracts'
import {
  createInitialProviderState,
  normalizeCategoryList,
  normalizePromptLibraryItems,
  resolveActiveCategoryFilter,
} from './domain'

export function buildPersistedAppStateSnapshot(state: AppState): PersistedAppStateSnapshot {
  // 注意：settings / providers / activeProviderId 属于敏感配置（含 apiKey），
  // 不写入明文 localStorage，统一由密码加密保险库（vault）管理。
  return {
    categories: state.categories,
    activeCategoryFilter: state.activeCategoryFilter,
    params: state.params,
    promptLibrary: state.promptLibrary,
    galleryDisplayMode: state.galleryDisplayMode,
    appView: state.appView,
  }
}

function resolveGalleryDisplayMode(value: unknown): GalleryDisplayMode {
  return value === 'image' ? 'image' : 'standard'
}

function resolveAppView(value: unknown): AppView {
  return value === 'square' ? 'square' : 'local'
}

export function readPersistedAppStateSnapshot(input: unknown): PersistedAppStateSnapshot | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return null
  }

  return input as PersistedAppStateSnapshot
}

export function mergePersistedAppState(
  persistedState: Partial<AppState> | undefined,
  currentState: AppState,
): AppState {
  // settings / providers / activeProviderId 已从持久化快照中移除，
  // 这里仅以“空密钥默认态”初始化；真实配置在解锁保险库后由 vaultSlice 填充。
  const lockedProviderState = createInitialProviderState({
    ...DEFAULT_SETTINGS,
    apiKey: '',
  })
  const normalizedCategories = normalizeCategoryList(persistedState?.categories)
  const normalizedPromptLibrary = normalizePromptLibraryItems(persistedState?.promptLibrary)

  return {
    ...currentState,
    ...persistedState,
    settings: lockedProviderState.settings,
    providers: lockedProviderState.providers,
    activeProviderId: lockedProviderState.activeProviderId,
    categories: normalizedCategories,
    activeCategoryFilter: resolveActiveCategoryFilter(
      persistedState?.activeCategoryFilter,
      normalizedCategories,
    ),
    params: {
      ...currentState.params,
      ...persistedState?.params,
    },
    promptLibrary: normalizedPromptLibrary,
    galleryDisplayMode: resolveGalleryDisplayMode(persistedState?.galleryDisplayMode),
    appView: resolveAppView(persistedState?.appView),
  }
}
