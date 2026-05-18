import { memo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'react-feather'
import { cardHover } from '@/animations'

const COLOR_MAP = {
  primary: { bg: 'bg-bw-primary/10', text: 'text-bw-primary', border: 'border-bw-primary/20' },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  warning: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20'   },
  danger:  { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20'     },
  info:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20'    },
}

/**
 * Dashboard statistics card.
 * - Responsive padding
 * - Truncates long titles on small screens
 * - Memoised
 */
const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  trendLabel,
  loading = false,
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.primary

  if (loading) {
    return (
      <div className="bw-card p-4 sm:p-5 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-bw-surface rounded" />
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-bw-surface rounded-xl" />
        </div>
        <div className="h-6 sm:h-7 w-28 sm:w-32 bg-bw-surface rounded" />
        <div className="h-3 w-20 bg-bw-surface rounded" />
      </div>
    )
  }

  return (
    <motion.div
      {...cardHover}
      className={`bw-card p-4 sm:p-5 border ${c.border} cursor-default`}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
        {/* Title — truncates on small screens */}
        <p className="text-xs sm:text-sm text-bw-muted font-medium leading-snug line-clamp-2">
          {title}
        </p>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon size={16} className={c.text} />}
        </div>
      </div>

      <p className={`text-xl sm:text-2xl font-bold ${c.text} mb-1`}>
        {value ?? '-'}
      </p>

      {(trend !== undefined || trendLabel) && (
        <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2">
          {trend !== undefined && (
            trend >= 0
              ? <TrendingUp size={12} className="text-emerald-400" />
              : <TrendingDown size={12} className="text-red-400" />
          )}
          {trendLabel && <span className="text-xs text-bw-muted">{trendLabel}</span>}
        </div>
      )}
    </motion.div>
  )
})

export default StatCard
