import api from './api'

/** Fetch all settings from the backend */
export const fetchSettings = () => api.get('/setting')

/**
 * Create a new setting document
 * @param {{ key: string, value: string }} payload
 */
export const createSetting = (payload) => api.post('/setting', payload)

/**
 * Update an existing setting by its MongoDB _id
 * @param {string} id - The setting document _id
 * @param {{ value: string }} payload
 */
export const updateSetting = (id, payload) => api.put(`/setting/${id}`, payload)
