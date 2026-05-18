import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { memo } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import { selectSidebarCollapsed } from '@/store/selectors'
import { pageTransition } from '@/animations'

/**
 * Main authenticated layout.
 * - Sidebar is off-canvas on mobile (toggled via Navbar hamburger)
 * - Content area shifts right on lg+ based on sidebar state
 * - Safe area insets for notched phones
 */
export default memo(function MainLayout() {
  const collapsed = useSelector(selectSidebarCollapsed)
  const location = useLocation()

  return (
    <div className="min-h-screen min-h-[100dvh] bg-bw-dark flex">
      <Sidebar />

      {/* Main content */}
      <div
        className={[
          'flex-1 flex flex-col min-h-screen min-h-[100dvh]',
          'transition-all duration-300 ease-in-out',
          /* On mobile: no margin (sidebar is off-canvas) */
          /* On lg+: shift right based on sidebar width */
          collapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]',
        ].join(' ')}
      >
        <Navbar />

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            {...pageTransition}
            className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
})
