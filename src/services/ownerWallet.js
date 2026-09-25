import api from './api'

/**
 * Fetch owner wallet status (safe — never returns private key)
 * @returns {Promise<{ data: { success: boolean, data: { isConfigured: boolean, address: string | null, source: 'database' | 'env' | 'none', updatedAt: string | null } } }>}
 */
export const fetchOwnerWalletStatus = () => api.get('/admin/owner-wallet/status')

/**
 * Encrypt and save / update owner private key in database
 * @param {string} privateKey - EVM private key
 * @returns {Promise<{ data: { success: boolean, message: string, data: { address: string, updatedAt: string } } }>}
 */
export const updateOwnerWalletKey = (privateKey) =>
  api.post('/admin/owner-wallet', { privateKey })

/**
 * Remove owner private key from database
 * @returns {Promise<{ data: { success: boolean, message: string } }>}
 */
export const deleteOwnerWalletKey = () => api.delete('/admin/owner-wallet')
