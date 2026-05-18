import { memo } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/animations'
import { SkeletonTable } from './Skeleton'
import { AlertCircle } from 'react-feather'

/**
 * BW themed data table.
 * Handles loading, error, and empty states automatically.
 * Rows are memoised to prevent unnecessary re-renders.
 *
 * columns: [{ key, header, render?, align?, width? }]
 * data: array of row objects
 */

// Memoised single row — only re-renders when its own data changes
const TableRow = memo(function TableRow({ row, columns }) {
  return (
    <motion.tr variants={staggerItem}>
      {columns.map((col) => (
        <td
          key={col.key}
          className={
            col.align === 'center'
              ? 'text-center'
              : col.align === 'right'
              ? 'text-right'
              : ''
          }
        >
          {col.render ? col.render(row) : (row[col.key] ?? '-')}
        </td>
      ))}
    </motion.tr>
  )
})

export default memo(function Table({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyMessage = 'No data found.',
  keyField = '_id',
}) {
  if (loading) return <SkeletonTable rows={6} cols={columns.length} />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
        <AlertCircle size={36} />
        <p className="text-sm">Something went wrong. Please try again.</p>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-bw-muted">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="bw-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : ''
                }
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
          {data.map((row, idx) => (
            <TableRow key={row[keyField] || idx} row={row} columns={columns} />
          ))}
        </motion.tbody>
      </table>
    </div>
  )
})
