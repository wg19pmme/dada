import type { AppView, GalleryDisplayMode } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import type { AppState, PersistedAppStateSnapshot } from './contracts'
import {
  createInitialProviderState,
  getProviderSettings,
  normalizeCategoryList,
  normalizePromptLibraryItems,
  normalizeProviderList,
  resolveActiveCategoryFilter,
} from './domain'

export function buildPersistedAppStateSnapshot(state: AppState): PersistedAppStateSnapshot {
  return {
    settings: state.settings,
    providers: state.providers,
    activeProviderId: state.activeProviderId,
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
  const normalizedProviders = normalizeProviderList(persistedState?.providers)
  const normalizedCategories = normalizeCategoryList(persistedState?.categories)
  const normalizedPromptLibrary = normalizePromptLibraryItems(persistedState?.promptLibrary)
  const providerState =
    normalizedProviders.length > 0
      ? (() => {
          const activeProvider =
            normalizedProviders.find((provider) => provider.id === persistedState?.activeProviderId) ??
            normalizedProviders[0]

          return {
            providers: normalizedProviders,
            activeProviderId: activeProvider.id,
            settings: getProviderSettings(activeProvider),
          }
        })()
      : createInitialProviderState({
          ...currentState.settings,
          ...persistedState?.settings,
        })

  // 本地便携版：API 上游接口设置始终以源码 local-config.ts 为准，
  // 忽略浏览器本地缓存中可能残留的旧设置，保证“改源码即生效”。
  const sourceSettings = { ...DEFAULT_SETTINGS }
  const sourceProvider = providerState.providers.map((provider) => ({
    ...provider,
    ...sourceSettings,
  }))

  return {
    ...currentState,
    ...persistedState,
    settings: sourceSettings,
    providers: sourceProvider,
    activeProviderId: providerState.activeProviderId,
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
