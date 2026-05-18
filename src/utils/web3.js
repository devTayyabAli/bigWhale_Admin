/**
 * Thin re-export of contract helpers for use outside of pages.
 * Keeps import paths clean: import { kgcToUSDT } from '@/utils/web3'
 */
export { kgcToUSDT, kgcBalance, fetchKGCTokens } from '@/contract/staking'
