import api from './api'

/** Fetch the current token rate from the backend */
export const fetchRate = () => api.get('/admin/set-rate')

/** Persist the new rate to the backend after on-chain tx */
export const setRate = (payload) => api.post('/admin/set-rate', payload)
