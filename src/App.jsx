import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppRoutes from './routes'
import { selectTheme, selectIsAuthenticated } from './store/selectors'
import SocketProvider from './context/SocketProvider'
import { fetchAdminNotifications } from './store/slices/notificationsSlice'

/**
 * Root application component.
 * Applies the saved dark/light theme class to <html> on mount and on change.
 * Fetches initial admin notifications once the admin is authenticated.
 */
export default function App() {
  const dispatch        = useDispatch()
  const theme           = useSelector(selectTheme)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [theme])

  // Fetch notifications once authenticated (e.g. after login or page refresh)
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAdminNotifications())
    }
  }, [isAuthenticated, dispatch])

  return (
    <BrowserRouter>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </BrowserRouter>
  )
}
