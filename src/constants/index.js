/** Currency display symbol */
export const CURRENCY_SYMBOL = '($)'

/** Decimal places for token amounts */
export const ROUND_OFF_TO = 4

/** 1 USDC reference value */
export const ONE_USDC = 1

/** Staking limits */
export const STAKE_MIN = 50
export const STAKE_MAX = 500_000

/** Supported chain IDs */
export const CHAIN_IDS = {
  97: 'Binance Testnet',
  56: 'Binance Mainnet',
}

/** Date filter options */
export const DATE_FILTER_OPTIONS = ['all', 'daily', 'weekly', 'monthly', 'date range']

/** User status options */
export const USER_STATUS_OPTIONS = ['all', 'pending', 'active', 'banned']

/** Gift reward status options */
export const GIFT_STATUS_OPTIONS = ['all', 'pending', 'accepted', 'rejected']

/** Star reward options */
export const STAR_REWARD_OPTIONS = [
  'all',
  '1 star reward',
  '2 star reward',
  '3 star reward',
  '4 star reward',
  '5 star reward',
  '6 star reward',
  '7 star reward',
]

/** Navigation config — single source of truth */
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'Home',
    path: '/dashboard',
  },
  {
    id: 'users',
    title: 'Users',
    icon: 'Users',
    path: '/users/all-users',
  },
  {
    id: 'gift-rewards',
    title: 'Star Win Requests',
    icon: 'Gift',
    path: '/gift-rewards',
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'BarChart2',
    children: [
      { id: 'banned-user', title: 'Banned Users', icon: 'UserX', path: '/banned-user' },
      { id: 'cash-inflow', title: 'Cash Inflow', icon: 'TrendingUp', path: '/cash-inflow' },
      { id: 'cash-outflow', title: 'Cash Outflow', icon: 'TrendingDown', path: '/cash-outflow' },
      { id: 'global-turnover', title: 'Global Turnover', icon: 'RefreshCcw', path: '/global-turnover' },
      { id: 'salary-rank-history', title: 'Salary Rank History', icon: 'Award', path: '/salary-rank-history' },
    ],
  },
  {
    id: 'set-rate',
    title: 'Set Rate',
    icon: 'Sliders',
    path: '/set-rate',
  },
  {
    id: 'stake-users',
    title: 'Stake Users',
    icon: 'TrendingUp',
    path: '/stake-users',
  },
  {
    id: 'accounts-details',
    title: 'Accounts Details',
    icon: 'FileText',
    path: '/users-details',
  },
  {
    id: 'banner',
    title: 'Banner',
    icon: 'Bell',
    path: '/banner',
  },
  {
    id: 'support',
    title: 'Support',
    icon: 'MessageSquare',
    path: '/support-history',
  },
  {
    id: 'whatsapp-settings',
    title: 'WhatsApp Settings',
    icon: 'MessageCircle',
    path: '/whatsapp-settings',
  },
]
