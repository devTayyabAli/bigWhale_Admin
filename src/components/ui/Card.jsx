import { motion } from 'framer-motion'
import { cardHover } from '@/animations'

/**
 * BW themed card.
 * CardHeader stacks vertically on mobile, horizontal on sm+.
 */
export function Card({ children, className = '', hover = false, ...props }) {
  const Comp = hover ? motion.div : 'div'
  const hoverProps = hover ? cardHover : {}
  return (
    <Comp {...hoverProps} className={`bw-card ${className}`} {...props}>
      {children}
    </Comp>
  )
}

export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col sm:flex-row sm:items-center justify-between',
        'gap-3 px-4 sm:px-5 py-4 border-b border-bw-border',
        className,
      ].join(' ')}
    >
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-bw-text truncate">{title}</h3>
        {subtitle && <p className="text-xs text-bw-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>
}
