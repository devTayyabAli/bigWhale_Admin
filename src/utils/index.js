import dayjs from 'dayjs'

/**
 * Capitalize the first letter of every word
 * @param {string} str
 */
export const capitalizeWords = (str = '') =>
  String(str).replace(/\b\w/g, (c) => c.toUpperCase())

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
  Number(Number(num || 0).toFixed(decimals))

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
 * Format reward or transfer type string into clean human-readable title
 * e.g. "income_level" -> "Level Income", "staking_reward" -> "Staking Reward"
 */
export const formatRewardType = (typeStr = '') => {
  if (!typeStr) return '-'
  const normalized = String(typeStr).toLowerCase().trim()
  
  const map = {
    income_level: 'Level Income',
    incomelevel: 'Level Income',
    level_income: 'Level Income',
    levelincome: 'Level Income',
    level: 'Level Income',
    staking_reward: 'Staking Reward',
    stakereward: 'Staking Reward',
    stake_reward: 'Staking Reward',
    staking: 'Staking Reward',
    star_reward: 'Star Reward',
    star: 'Star Reward',
    gift_reward: 'Gift Reward',
    gift: 'Gift Reward',
    salary_reward: 'Salary Reward',
    salary: 'Salary Reward',
    referral_bonus: 'Referral Bonus',
    referral: 'Referral Bonus',
    fund_transfer: 'Fund Transfer',
    transfer: 'Fund Transfer',
    registration_fee: 'Registration Fee',
  }

  if (map[normalized]) return map[normalized]

  // Default fallback: replace underscores/dashes with spaces and capitalize
  return capitalizeWords(String(typeStr).replace(/[-_]/g, ' '))
}

/**
 * Format status string into clean display text
 * Defaults to "Completed" if empty
 */
export const formatStatusText = (statusStr) => {
  if (!statusStr) return 'Completed'
  const normalized = String(statusStr).toLowerCase().trim()
  
  const map = {
    active: 'Active',
    banned: 'Banned',
    pending: 'Pending',
    accepted: 'Accepted',
    approved: 'Approved',
    completed: 'Completed',
    success: 'Completed',
    successful: 'Completed',
    distributed: 'Distributed',
    claimed: 'Claimed',
    rejected: 'Rejected',
    failed: 'Failed',
    inactive: 'Inactive',
    todo: 'Pending',
    'in-progress': 'Active',
  }

  if (map[normalized]) return map[normalized]
  return capitalizeWords(String(statusStr).replace(/[-_]/g, ' '))
}

/**
 * Get status badge class name
 */
export const getStatusBadge = (status = '') => {
  const normalized = String(status || 'completed').toLowerCase().trim()
  const map = {
    active: 'badge-active',
    banned: 'badge-banned',
    pending: 'badge-pending',
    accepted: 'badge-accepted',
    approved: 'badge-accepted',
    completed: 'badge-accepted',
    success: 'badge-accepted',
    successful: 'badge-accepted',
    distributed: 'badge-accepted',
    claimed: 'badge-accepted',
    rejected: 'badge-banned',
    failed: 'badge-banned',
    inactive: 'badge-banned',
    todo: 'badge-pending',
    'in-progress': 'badge-active',
  }
  return map[normalized] || 'badge-accepted'
}
