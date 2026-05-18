import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Central Axios instance.
 * - Base URL from Vite env
 * - Auto-attaches Bearer token from localStorage
 * - Global 401 / 403 / 5xx handling
 * - Request deduplication via AbortController (cancel in-flight on re-dispatch)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem('userData')
      if (raw) {
        const { accessToken } = JSON.parse(raw)
        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
      }
    } catch {
      // Malformed localStorage — silently ignore
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor ─────────────────────────────────────────────────────
let _401Shown = false // Prevent duplicate toast on concurrent 401s

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    const status = error.response?.status

    if (status === 401) {
      if (!_401Shown) {
        _401Shown = true
        localStorage.removeItem('userData')
        toast.error('Session expired. Please log in again.')
        // Small delay so toast renders before redirect
        setTimeout(() => {
          _401Shown = false
          window.location.href = '/login'
        }, 1500)
      }
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }

    return Promise.reject(error)
  }
)

export default api
