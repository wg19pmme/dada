import type {
  AppSettings,
  AppView,
  CategoryConfig,
  GalleryDisplayMode,
  ImageEditSession,
  InputImage,
  PromptLibraryItem,
  ProviderConfig,
  SquareShareTarget,
  TaskParams,
  TaskRecord,
  TaskView,
} from '../types'

/** 需要放入密码保险库加密保存的敏感配置快照 */
export interface VaultSnapshot {
  settings: AppSettings
  providers: ProviderConfig[]
  activeProviderId: string
}

export interface AppState {
  appView: AppView
  setAppView: (view: AppView) => void

  settings: AppSettings
  providers: ProviderConfig[]
  activeProviderId: string
  setSettings: (settings: Partial<AppSettings>) => void
  setActiveProvider: (id: string) => void
  createProvider: () => void
  updateProviderName: (id: string, name: string) => void
  removeProvider: (id: string) => void
  replaceProviderState: (providers: ProviderConfig[], activeProviderId?: string) => void

  prompt: string
  setPrompt: (prompt: string) => void
  promptLibrary: PromptLibraryItem[]
  replacePromptLibrary: (items: PromptLibraryItem[]) => void
  savePromptLibraryItem: (input: { title?: string; content: string }) => PromptLibraryItem
  removePromptLibraryItem: (id: string) => void
  inputImages: InputImage[]
  addInputImage: (image: InputImage) => void
  removeInputImage: (index: number) => void
  clearInputImages: () => void
  setInputImages: (images: InputImage[]) => void

  params: TaskParams
  setParams: (params: Partial<TaskParams>) => void

  tasks: TaskRecord[]
  setTasks: (tasks: TaskRecord[]) => void
  selectedTaskIds: string[]
  setSelectedTaskIds: (ids: string[]) => void
  toggleTaskSelection: (id: string) => void
  clearSelectedTasks: () => void

  categories: CategoryConfig[]
  activeCategoryFilter: string
  setActiveCategoryFilter: (filter: string) => void
  replaceCategoryState: (categories: CategoryConfig[], activeCategoryFilter?: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterStatus: 'all' | 'running' | 'done' | 'error' | 'partial_error'
  setFilterStatus: (status: AppState['filterStatus']) => void
  taskView: TaskView
  setTaskView: (view: TaskView) => void
  galleryDisplayMode: GalleryDisplayMode
  setGalleryDisplayMode: (mode: GalleryDisplayMode) => void

  imageEditSession: ImageEditSession | null
  setImageEditSession: (session: ImageEditSession | null) => void
  detailTaskId: string | null
  setDetailTaskId: (id: string | null) => void
  lightboxImageId: string | null
  lightboxImageList: string[]
  setLightboxImageId: (id: string | null, list?: string[]) => void
  showSettings: boolean
  setShowSettings: (visible: boolean) => void
  showPromptLibrary: boolean
  setShowPromptLibrary: (visible: boolean) => void

  // 密码保险库（vault）状态
  unlocked: boolean
  setUnlocked: (unlocked: boolean) => void
  setupVault: (password: string, snapshot: VaultSnapshot) => Promise<void>
  saveVault: (snapshot: VaultSnapshot) => Promise<void>
  commitVault: () => Promise<void>
  unlockVault: (password: string) => Promise<boolean>
  lockVault: () => void
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>

  // 云端便携版（Cloudflare Pages 远程配置）状态
  remoteEnabled: boolean
  initRemoteConfig: () => Promise<boolean>
  loginRemote: (password: string) => Promise<boolean>
  lockRemote: () => void

  shareToSquareTarget: SquareShareTarget | null
  setShareToSquareTarget: (target: SquareShareTarget | null) => void

  toast: { message: string; type: 'info' | 'success' | 'error' } | null
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void

  confirmDialog: {
    title: string
    message: string
    confirmText?: string
    action: () => void | Promise<void>
  } | null
  setConfirmDialog: (dialog: AppState['confirmDialog']) => void
}

export type PersistedAppStateSnapshot = Partial<
  Pick<
    AppState,
    | 'settings'
    | 'providers'
    | 'activeProviderId'
    | 'categories'
    | 'activeCategoryFilter'
    | 'params'
    | 'promptLibrary'
    | 'galleryDisplayMode'
    | 'appView'
  >
> &
  Record<string, unknown>

export type StoreApiError = Error & {
  status?: number
  requestId?: string
  details?: unknown
}
