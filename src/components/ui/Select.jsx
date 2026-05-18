import { forwardRef } from 'react'
import { ChevronDown } from 'react-feather'

/**
 * BW themed select.
 * - min-height 44px for touch targets
 * - font-size 16px on mobile prevents iOS auto-zoom
 */
const Select = forwardRef(function Select(
  { label, error, options = [], className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-bw-text-secondary">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={[
            'bw-input appearance-none pr-9 cursor-pointer min-h-[44px]',
            error ? 'border-red-500' : '',
            className,
          ].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={typeof opt === 'object' ? opt.value : opt}
              value={typeof opt === 'object' ? opt.value : opt}
              className="bg-bw-card text-bw-text"
            >
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-bw-muted pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})

export default Select
