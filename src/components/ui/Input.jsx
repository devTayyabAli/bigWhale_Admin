import { forwardRef } from 'react'

/**
 * BW themed input.
 * - font-size 16px on mobile prevents iOS auto-zoom on focus
 * - min-height 44px for touch targets
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconClick,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-bw-text-secondary">{label}</label>
      )}
      <div className="relative">
        {LeftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bw-muted pointer-events-none">
            <LeftIcon size={16} />
          </span>
        )}
        <input
          ref={ref}
          className={[
            'bw-input min-h-[44px]',
            LeftIcon ? 'pl-9' : '',
            RightIcon ? 'pr-10' : '',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bw-muted
                       hover:text-bw-text transition-colors p-1 min-h-[44px] min-w-[44px]
                       flex items-center justify-center"
            aria-label="Toggle input"
          >
            <RightIcon size={16} />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-bw-muted">{hint}</p>}
    </div>
  )
})

export default Input
