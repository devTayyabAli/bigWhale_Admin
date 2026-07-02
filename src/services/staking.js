import api from './api'

/**
 * Create a pending stake record before the on-chain transaction.
 * POST /stake
 * Body: { userId, amount }
 */
export const stakeKGC = (payload) => api.post('/stake', payload)

/**
 * After the on-chain tx hash is received, save transaction details.
 * POST /stake/complete/:id
 * Body: { userId, txHash, fiatAmount, cryptoAmount }
 */
export const completeStake = ({ id, data }) =>
  api.post(`/stake/complete/${id}`, data)

/**
 * After the on-chain tx is confirmed (receipt), activate the stake.
 * Calls handleStakeEvent on the server which:
 *   - Sets Transaction.status → "completed"
 *   - Sets Stake.status      → "active"
 *   - Triggers instant bonus for referrer
 * POST /transaction/stake/:txHash
 */
export const activateStake = (txHash) =>
  api.post(`/transaction/stake/${txHash}`)
