import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import AppRoutes from './routes'
import { selectTheme } from './store/selectors'

/**
 * Root application component.
 * Applies the saved dark/light theme class to <html> on mount and on change.
 */
export default function App() {
  const theme = useSelector(selectTheme)

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [theme])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
