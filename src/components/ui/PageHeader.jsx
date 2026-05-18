import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'react-feather'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/animations'

/**
 * Consistent page header.
 * - Stacks vertically on mobile
 * - Back button has a large tap target
 * - Actions wrap on small screens
 */
export default function PageHeader({ title, subtitle, backPath, actions }) {
  const navigate = useNavigate()

  return (
    <motion.div
      {...fadeInUp}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {backPath && (
          <button
            onClick={() => navigate(backPath)}
            className="p-2 rounded-xl text-bw-muted hover:text-bw-text hover:bg-bw-surface
                       transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]
                       flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-bw-text truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-bw-muted mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  )
}
