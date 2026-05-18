import { memo, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'react-feather'

/**
 * BW themed pagination.
 * - Compact on mobile: shows fewer page numbers
 * - Full on sm+
 */
const Pagination = memo(function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
}) {
  const from = (currentPage - 1) * limit + 1
  const to = Math.min(currentPage * limit, totalItems)

  // Fewer pages shown on mobile (delta=1), more on desktop (delta=2)
  const pages = useMemo(() => {
    const result = []
    const delta = 1 // keep compact for all sizes; ellipsis handles the rest
    const left = currentPage - delta
    const right = currentPage + delta

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        result.push(i)
      } else if (result[result.length - 1] !== '...') {
        result.push('...')
      }
    }
    return result
  }, [currentPage, totalPages])

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col xs:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-bw-border">
      {/* Count — hidden on very small screens */}
      <p className="text-xs text-bw-muted hidden sm:block">
        Showing{' '}
        <span className="text-bw-text font-medium">{from}–{to}</span> of{' '}
        <span className="text-bw-text font-medium">{totalItems}</span>
      </p>

      {/* Mobile count — compact */}
      <p className="text-xs text-bw-muted sm:hidden">
        {currentPage} / {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                     min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-bw-muted text-sm">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={[
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                'min-h-[32px] min-w-[32px] flex items-center justify-center',
                page === currentPage
                  ? 'bg-bw-primary text-white shadow-glow'
                  : 'text-bw-text-secondary hover:bg-bw-surface hover:text-bw-text',
              ].join(' ')}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                     min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
})

export default Pagination
