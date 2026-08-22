import type { TaskParams } from '../../../../types'
import Select from '../../../../shared/components/Select'
import { MODERATION_OPTIONS, OUTPUT_FORMAT_OPTIONS } from './paramsSectionShared'

interface ParamsAdvancedFieldsProps {
  compact?: boolean
  params: TaskParams
  outputCompressionInput: string
  nInput: string
  selectClass: string
  onSetParams: (params: Partial<TaskParams>) => void
  onOutputCompressionInputChange: (value: string) => void
  onCommitOutputCompression: () => void
  onNInputChange: (value: string) => void
  onCommitN: () => void
}

export default function ParamsAdvancedFields({
  compact = false,
  params,
  outputCompressionInput,
  nInput,
  selectClass,
  onSetParams,
  onOutputCompressionInputChange,
  onCommitOutputCompression,
  onNInputChange,
  onCommitN,
}: ParamsAdvancedFieldsProps) {
  return (
    <>
      <div className={`grid grid-cols-2 ${compact ? 'gap-2.5' : 'gap-3'}`}>
        <label className={`flex flex-col ${compact ? 'gap-1' : 'gap-1.5'}`}>
          <span className="font-medium text-gray-500 dark:text-gray-400">格式</span>
          <Select
            value={params.output_format}
            onChange={(value) => onSetParams({ output_format: value as TaskParams['output_format'] })}
            options={OUTPUT_FORMAT_OPTIONS as unknown as Array<{ label: string; value: string }>}
            className={selectClass}
          />
        </label>
        <label className={`flex flex-col ${compact ? 'gap-1' : 'gap-1.5'}`}>
          <span className="font-medium text-gray-500 dark:text-gray-400">压缩率</span>
          <input
            value={outputCompressionInput}
            onChange={(event) => onOutputCompressionInputChange(event.target.value)}
            onBlur={onCommitOutputCompression}
            disabled={params.output_format === 'png'}
            type="number"
            min={0}
            max={100}
            placeholder="0-100"
            className={`rounded-xl border border-gray-200/60 px-3 shadow-sm transition-all duration-200 focus:outline-none dark:border-white/[0.08] ${
              params.output_format === 'png'
                ? 'cursor-not-allowed bg-gray-100/50 opacity-50 dark:bg-white/[0.05]'
                : 'bg-white/50 dark:bg-white/[0.03]'
            } ${compact ? 'py-2.5 text-[13px]' : 'py-2 text-sm'}`}
          />
        </label>
      </div>

      <div className={`grid grid-cols-2 ${compact ? 'gap-2.5' : 'gap-3'}`}>
        <label className={`flex flex-col ${compact ? 'gap-1' : 'gap-1.5'}`}>
          <span className="font-medium text-gray-500 dark:text-gray-400">审核</span>
          <Select
            value={params.moderation}
            onChange={(value) => onSetParams({ moderation: value as TaskParams['moderation'] })}
            options={MODERATION_OPTIONS as unknown as Array<{ label: string; value: string }>}
            className={selectClass}
          />
        </label>
        <label className={`flex flex-col ${compact ? 'gap-1' : 'gap-1.5'}`}>
          <span className="font-medium text-gray-500 dark:text-gray-400">数量</span>
          <input
            value={nInput}
            onChange={(event) => onNInputChange(event.target.value)}
            onBlur={onCommitN}
            type="number"
            min={1}
            max={4}
            className={`rounded-xl border border-gray-200/60 bg-white/50 px-3 shadow-sm transition-all duration-200 focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.03] ${
              compact ? 'py-2.5 text-[13px]' : 'py-2 text-sm'
            }`}
          />
        </label>
      </div>
    </>
  )
}
