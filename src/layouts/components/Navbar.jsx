import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, Bell, LogOut, User, ChevronDown } from 'react-feather'
import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleSidebar, toggleTheme, toggleMobileSidebar } from '@/store/slices/customizerSlice'
import { logout } from '@/store/slices/authSlice'
import { selectTheme, selectUser } from '@/store/selectors'
import { scaleIn } from '@/animations'

const UserAvatar = memo(function UserAvatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-bw-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {name?.[0]?.toUpperCase() || 'A'}
    </div>
  )
})

export default memo(function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useSelector(selectTheme)
  const user  = useSelector(selectUser)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const onMouse = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    const onKey = (e) => { if (e.key === 'Escape') setDropdownOpen(false) }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleLogout = useCallback(() => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }, [dispatch, navigate])

  const handleToggleDropdown = useCallback(() => setDropdownOpen((o) => !o), [])

  const handleChangePassword = useCallback(() => {
    setDropdownOpen(false)
    navigate('/change-password')
  }, [navigate])

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-3 sm:px-4 md:px-6 h-14 sm:h-16 bg-bw-card/90 backdrop-blur-md border-b border-bw-border flex-shrink-0">
      {/* Left: hamburger buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile hamburger */}
        <button
          onClick={() => dispatch(toggleMobileSidebar())}
          className="lg:hidden p-2 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="hidden lg:flex p-2 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface transition-colors"
          aria-label="Collapse sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-bw-primary rounded-full" aria-hidden="true" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleDropdown}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1.5 rounded-xl hover:bg-bw-surface transition-colors"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <UserAvatar name={user?.name} />
            {/* Name — hidden on mobile to save space */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-bw-text leading-tight max-w-[100px] truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-bw-muted capitalize">{user?.role || 'admin'}</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-bw-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                {...scaleIn}
                role="menu"
                className="absolute right-0 mt-2 w-52 bw-card py-1 shadow-card-hover origin-top-right z-50"
              >
                <div className="px-4 py-2.5 border-b border-bw-border">
                  <p className="text-sm font-semibold text-bw-text truncate">{user?.name}</p>
                  <p className="text-xs text-bw-muted truncate">{user?.email}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-bw-text-secondary hover:bg-bw-surface hover:text-bw-text transition-colors"
                >
                  <User size={15} />
                  Change Password
                </button>
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
})
