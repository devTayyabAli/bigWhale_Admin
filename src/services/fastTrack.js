import api from './api'

/** 7 salary ranks + the live 20% pool scale. */
export const getFastTrackRanks = () => api.get('/admin/fast-track/ranks')

/** @param {{ starKey:number, rewardPercentage:number|string, directTeam:number|string }[]} ranks */
export const updateFastTrackRanks = (ranks) => api.put('/admin/fast-track/ranks', { ranks })

/** Plan-wide counters: unlocks, ranks, stakes, 24h payouts, salary, pending withdrawals. */
export const getFastTrackStats = () => api.get('/admin/fast-track/stats')

/** Last admin actions and rank-sync runs. */
export const getFastTrackAudit = () => api.get('/admin/fast-track/audit')

/** Recompute every sponsor's rank and 2X unlock from staked directs. Promotion only. */
export const resyncAllRanks = () => api.post('/admin/fast-track/resync')

/** Set every rank to exactly the staked-direct qualification. Can clear old ranks. */
export const resetRanksToQualification = (body) => api.post('/admin/fast-track/reset-ranks', body)

/** Fast-track withdrawals (default: pending). */
export const getFastTrackWithdrawals = (status = 'pending') =>
  api.get('/admin/fast-track/withdrawals', { params: { status } })

/** Cancel a pending withdrawal that has not consumed a joining credit. */
export const cancelFastTrackWithdrawal = (id, body) =>
  api.post(`/admin/fast-track/withdrawals/${id}/cancel`, body)

/** One user's fast-track status. */
export const getUserFastTrack = (userId) => api.get(`/admin/fast-track/user/${userId}`)

/** Set the user's unused withdrawal credits to an absolute value. */
export const setUserCredits = (userId, body) =>
  api.put(`/admin/fast-track/user/${userId}/credits`, body)

/** Clear the rolling 24h withdrawal window. */
export const resetUserWindow = (userId, body) =>
  api.post(`/admin/fast-track/user/${userId}/reset-window`, body)

/** Recompute this user's rank and 2X unlock now. */
export const resyncUserRank = (userId) => api.post(`/admin/fast-track/user/${userId}/resync`)
