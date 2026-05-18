import api from './api'

/** Create a staking record before the on-chain transaction */
export const stakeKGC = (payload) => api.post('/admin/stake', payload)

/** Update staking record with tx hash (called from onTransactionHash callback) */
export const stakeKGCOnTransaction = ({ id, data }) =>
  api.put(`/admin/stake/${id}/transaction`, data)

/** Mark staking as complete after receipt */
export const completeStake = (txHash) =>
  api.put('/admin/stake/complete', { txHash })
