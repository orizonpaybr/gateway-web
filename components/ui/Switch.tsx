import { memo } from 'react'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Switch = memo<SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, className = '' }) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 max-[375px]:h-5 max-[375px]:w-9 ${
          checked ? 'bg-primary' : 'bg-gray-300'
        } ${className}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform max-[375px]:h-3.5 max-[375px]:w-3.5 ${
            checked
              ? 'translate-x-6 max-[375px]:translate-x-[22px]'
              : 'translate-x-1 max-[375px]:translate-x-[4px]'
          }`}
        />
      </button>
    )
  },
)

Switch.displayName = 'Switch'
