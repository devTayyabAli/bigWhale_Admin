import { motion } from 'framer-motion'
import { Loader } from 'react-feather'

const variants = {
  primary:   'bg-bw-gradient text-white hover:shadow-bw hover:opacity-90',
  secondary: 'bg-bw-surface text-bw-text border border-bw-border hover:border-bw-primary hover:text-bw-primary',
  danger:    'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
  success:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20',
  ghost:     'text-bw-text-secondary hover:bg-bw-surface hover:text-bw-text',
  outline:   'border border-bw-primary text-bw-primary hover:bg-bw-primary/10',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg min-h-[32px]',
  sm: 'px-3.5 py-1.5 text-sm rounded-lg min-h-[36px]',
  md: 'px-5 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-xl min-h-[48px]',
}

/**
 * BW themed button.
 * - min-height ensures touch-friendly tap targets on mobile
 * - fullWidth stretches to container on mobile
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="flex-shrink-0"
        >
          <Loader size={14} />
        </motion.span>
      )}
      {children}
    </motion.button>
  )
}
