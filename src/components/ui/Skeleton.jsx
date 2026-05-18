/**
 * Skeleton loaders — responsive, shimmer animated.
 */

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton h-4 rounded ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bw-card p-4 sm:p-5 space-y-3 ${className}`}>
      <SkeletonLine className="w-1/3 h-3" />
      <SkeletonLine className="w-full h-8" />
      <SkeletonLine className="w-2/3 h-3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex gap-3 px-3 sm:px-4 py-3 border-b border-bw-border">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} className="flex-1 h-3" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 px-3 sm:px-4 py-3 border-b border-bw-border/50">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bw-card p-4 sm:p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <SkeletonLine className="w-24 h-3" />
        <div className="skeleton w-10 h-10 rounded-xl" />
      </div>
      <SkeletonLine className="w-32 h-7" />
      <SkeletonLine className="w-20 h-3" />
    </div>
  )
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  )
}
