import { useEffect } from 'react'
import { initStore, startRecycleBinJanitor } from './store'
import { Header } from './app/components'
import { ImageContextMenu, TaskGrid } from './features/gallery'
import { InputBar, PromptLibraryDrawer, SearchBar } from './features/input'
import { DetailModal, ImageEditModal, Lightbox } from './features/viewer'
import { ConfirmDialog, Toast } from './shared/components'

export default function App() {
  useEffect(() => {
    initStore()
    const stopRecycleBinJanitor = startRecycleBinJanitor()

    return () => {
      stopRecycleBinJanitor()
    }
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      <InputBar />

      {/* 中间：画廊区 */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-y-auto pb-28 md:pb-0">
        <Header />
        <div className="max-w-7xl mx-auto w-full px-4 pb-12">
          <SearchBar />
          <TaskGrid />
        </div>
      </main>

      <ImageEditModal />
      <DetailModal />
      <Lightbox />
      <PromptLibraryDrawer />
      <ConfirmDialog />
      <Toast />
      <ImageContextMenu />
    </div>
  )
}
