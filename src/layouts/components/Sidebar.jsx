import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, memo, useCallback } from 'react'
import * as FeatherIcons from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import { closeMobileSidebar } from '@/store/slices/customizerSlice'
import { selectSidebarCollapsed, selectSidebarMobileOpen } from '@/store/selectors'
import { NAV_ITEMS } from '@/constants'

/* ── Icon helper ─────────────────────────────────────────────────── */
const Icon = memo(function Icon({ name, size = 18 }) {
  const Comp = FeatherIcons[name]
  return Comp ? <Comp size={size} /> : null
})

/* ── Single nav item ─────────────────────────────────────────────── */
const NavItem = memo(function NavItem({ item, collapsed, mobileOpen, onNavigate }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = item.path
    ? location.pathname.startsWith(item.path)
    : item.children?.some((c) => location.pathname.startsWith(c.path))

  // Auto-open parent when a child route is active
  useEffect(() => {
    if (isActive && item.children) setOpen(true)
  }, [isActive, item.children])

  const toggle = useCallback(() => setOpen((o) => !o), [])

  // Show labels: always on mobile (sidebar is full-width), only when not collapsed on desktop
  const showText = !collapsed || mobileOpen

  if (item.children) {
    return (
      <div>
        <button
          onClick={toggle}
          className={`nav-item w-full ${isActive ? 'text-bw-primary' : ''}`}
          aria-expanded={open}
        >
          <span className="flex-shrink-0">
            <Icon name={item.icon} />
          </span>
          {showText && (
            <>
              <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
              <FeatherIcons.ChevronRight
                size={14}
                className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
              />
            </>
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && showText && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-0.5 border-l border-bw-border pl-3">
                {item.children.map((child) => (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    onClick={onNavigate}
                    className={({ isActive: a }) => `nav-item text-sm ${a ? 'active' : ''}`}
                  >
                    <Icon name={child.icon} size={15} />
                    <span>{child.title}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      title={!showText ? item.title : undefined}
      onClick={onNavigate}
      className={({ isActive: a }) => `nav-item ${a ? 'active' : ''}`}
    >
      <span className="flex-shrink-0">
        <Icon name={item.icon} />
      </span>
      {showText && <span className="text-sm font-medium">{item.title}</span>}
    </NavLink>
  )
})

/* ── Sidebar ─────────────────────────────────────────────────────── */
export default memo(function Sidebar() {
  const dispatch = useDispatch()
  const location = useLocation()
  const collapsed  = useSelector(selectSidebarCollapsed)
  const mobileOpen = useSelector(selectSidebarMobileOpen)

  const closeOverlay = useCallback(() => {
    // Dispatch synchronously so the backdrop disappears before the new page renders
    dispatch(closeMobileSidebar())
  }, [dispatch])

  // Auto-close mobile sidebar on route change — synchronous dispatch
  useEffect(() => {
    dispatch(closeMobileSidebar())
  }, [location.pathname, dispatch])

  return (
    <>
      {/*
       * ── Mobile backdrop ────────────────────────────────────────
       * Use CSS transition instead of Framer Motion AnimatePresence.
       * Framer Motion's exit animation (200ms fade) keeps the backdrop
       * visible while the new page is already rendered — causing the blur overlay bug.
       * CSS opacity transition is instant enough to not cause this issue.
       */}
      <div
        className={[
          'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden',
          'transition-opacity duration-150',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={closeOverlay}
        aria-hidden="true"
      />

      {/*
       * ── Sidebar panel ──────────────────────────────────────────
       * IMPORTANT: plain <aside> — NOT motion.aside.
       * Framer Motion's inline `transform` style overrides Tailwind's
       * translate utilities, breaking the off-canvas hide/show on mobile.
       * CSS transitions handle the slide animation instead.
       */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        style={{
          /*
           * Use inline style for width so it transitions smoothly.
           * On mobile: always 260px (sidebar is either hidden or fully open).
           * On desktop: 68px when collapsed, 260px when expanded.
           * We can't do this with Tailwind alone because lg: variants
           * don't work in dynamic className strings with arbitrary values.
           */
        }}
        className={[
          /* Base */
          'fixed top-0 left-0 z-40 h-full flex flex-col',
          'bg-bw-card border-r border-bw-border',
          /* Smooth CSS transition for both translate and width */
          'transition-transform duration-300 ease-in-out',
          /*
           * Width:
           * - Mobile: always 260px (full, since it's off-canvas when closed)
           * - Desktop collapsed: 68px icon strip
           * - Desktop expanded: 260px
           */
          collapsed ? 'w-[260px] lg:w-[68px]' : 'w-[260px]',
          /*
           * Visibility (translate):
           * - Mobile default: -translate-x-full (hidden off-canvas)
           * - Mobile open:     translate-x-0    (slides in)
           * - Desktop:         translate-x-0    (always visible, lg overrides)
           *
           * NOTE: no Framer Motion on this element — CSS wins cleanly.
           */
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-bw-border flex-shrink-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-bw-gradient flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm select-none">BW</span>
          </div>
          {/* Show text: always on mobile, only when not collapsed on desktop */}
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0">
              <p className="text-gradient font-bold text-base leading-tight truncate">BigWhale</p>
              <p className="text-bw-muted text-xs">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Navigation — scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              onNavigate={closeOverlay}
            />
          ))}
        </nav>

        {/* Footer */}
        {(!collapsed || mobileOpen) && (
          <div className="px-4 py-3 border-t border-bw-border flex-shrink-0">
            <p className="text-bw-muted text-xs text-center">
              BW Admin v2.0 &copy; {new Date().getFullYear()}
            </p>
          </div>
        )}
      </aside>
    </>
  )
})
