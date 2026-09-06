import { getStatusBadge, formatStatusText } from '@/utils'

/**
 * Status badge — auto-colors and formats status string.
 * Also supports manual variant prop.
 */
export default function Badge({ status, children, variant, className = '' }) {
  const rawStatus = children || status || 'Completed'
  const displayStatus = formatStatusText(rawStatus)
  const cls = variant
    ? `bw-badge ${variant}`
    : getStatusBadge(rawStatus)

  return (
    <span className={`${cls} ${className}`}>
      {displayStatus}
    </span>
  )
}
