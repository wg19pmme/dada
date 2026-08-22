import type { Dispatch, SetStateAction } from 'react'
import { fieldClassName } from './apiSettingsShared'

interface ApiTimeoutFieldProps {
  timeoutInput: string
  setTimeoutInput: Dispatch<SetStateAction<string>>
  commitTimeout: () => void
}

export default function ApiTimeoutField({
  timeoutInput,
  setTimeoutInput,
  commitTimeout,
}: ApiTimeoutFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">请求超时 (秒)</span>
      <input
        value={timeoutInput}
        onChange={(event) => setTimeoutInput(event.target.value)}
        onBlur={commitTimeout}
        type="number"
        min={10}
        max={900}
        className={fieldClassName}
      />
    </label>
  )
}
