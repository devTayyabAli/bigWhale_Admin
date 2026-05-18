import { getStatusBadge } from '@/utils'

/**
 * Status badge — auto-colors based on status string.
 * Also supports manual variant prop.
 */
export default function Badge({ status, children, variant, className = '' }) {
  const cls = variant
    ? `bw-badge ${variant}`
    : getStatusBadge(status || children)

  return (
    <span className={`${cls} ${className}`}>
      {children || status}
    </span>
  )
}
