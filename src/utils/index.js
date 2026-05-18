import dayjs from 'dayjs'

/**
 * Capitalize the first letter of every word
 * @param {string} str
 */
export const capitalizeWords = (str = '') =>
  str.replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Format a date string with dayjs
 * @param {string|Date} date
 * @param {string} format
 */
export const formatDate = (date, format = 'DD-MMM-YYYY') =>
  date ? dayjs(date).format(format) : '-'

/**
 * Format a datetime string
 */
export const formatDateTime = (date) =>
  date ? dayjs(date).format('DD-MMM-YYYY hh:mm A') : '-'

/**
 * Truncate a wallet address: 0x1234...abcd
 */
export const truncateAddress = (address = '') => {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Round a number to N decimal places
 */
export const roundTo = (num, decimals = 4) =>
  Number(Number(num).toFixed(decimals))

/**
 * Safe JSON parse — returns null on failure
 */
export const safeJsonParse = (str) => {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

/**
 * Build query string from params object, omitting null/undefined values
 */
export const buildParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Get status badge class name
 */
export const getStatusBadge = (status = '') => {
  const map = {
    active: 'badge-active',
    banned: 'badge-banned',
    pending: 'badge-pending',
    accepted: 'badge-accepted',
    rejected: 'badge-rejected',
    completed: 'badge-accepted',
    todo: 'badge-pending',
    'in-progress': 'badge-active',
  }
  return map[status?.toLowerCase()] || 'bw-badge bg-bw-surface text-bw-muted'
}
