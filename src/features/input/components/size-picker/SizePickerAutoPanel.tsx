export default function SizePickerAutoPanel() {
  return (
    <div className="flex h-full animate-fade-in items-center justify-center pb-4 pt-8 text-center">
      <div>
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">自动尺寸</h4>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          不向模型传递具体的分辨率参数
          <br />
          由模型自己决定生成尺寸
        </p>
      </div>
    </div>
  )
}
