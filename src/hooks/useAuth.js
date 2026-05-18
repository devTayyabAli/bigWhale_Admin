import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { loginThunk, logout } from '@/store/slices/authSlice'
import {
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '@/store/selectors'

/**
 * Convenience hook for auth state and actions.
 * Uses memoised selectors — no unnecessary re-renders.
 */
export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const login = useCallback(
    (credentials) => dispatch(loginThunk(credentials)),
    [dispatch]
  )

  const signOut = useCallback(() => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }, [dispatch, navigate])

  return { user, loading, error, isAuthenticated, login, signOut }
}
