/**
 * NotificationBell
 *
 * Displays a bell icon in the admin Navbar.
 * - Shows an unread badge (red dot with count) when there are unread notifications.
 * - Opens a dropdown listing the latest rank-achievement notifications.
 * - Clicking "Mark all as read" calls the API and clears the badge.
 */
import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, Award, X, CheckCircle } from 'react-feather'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  selectNotificationItems,
  selectNotificationUnreadCount,
  selectNotificationsLoading,
} from '@/store/selectors'
import {
  fetchAdminNotifications,
  markAllRead,
  clearUnread,
} from '@/store/slices/notificationsSlice'
import { scaleIn } from '@/animations'

dayjs.extend(relativeTime)

/* Star emoji helper */
const starBadge = (starKey) => '⭐'.repeat(Math.min(starKey || 1, 7))

export default memo(function NotificationBell() {
  const dispatch     = useDispatch()
  const items        = useSelector(selectNotificationItems)
  const unreadCount  = useSelector(selectNotificationUnreadCount)
  const loading      = useSelector(selectNotificationsLoading)

  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  // Close on outside click or Escape
  useEffect(() => {
    const onMouse = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleOpen = useCallback(() => {
    setOpen((o) => !o)
    // Refresh list every time the panel opens
    dispatch(fetchAdminNotifications())
  }, [dispatch])

  const handleMarkAllRead = useCallback(async () => {
    await dispatch(markAllRead())
    dispatch(clearUnread())
  }, [dispatch])

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={18} />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full
                       flex items-center justify-center text-[10px] font-bold text-white leading-none"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            {...scaleIn}
            role="dialog"
            aria-label="Rank achievement notifications"
            className="absolute right-0 mt-2 w-80 sm:w-96 bw-card shadow-card-hover origin-top-right z-50
                       flex flex-col max-h-[480px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-bw-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-bw-primary" />
                <h3 className="text-sm font-semibold text-bw-text">Rank Achievements</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg text-bw-muted hover:text-bw-primary hover:bg-bw-surface transition-colors"
                    aria-label="Mark all notifications as read"
                  >
                    <CheckCircle size={15} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface transition-colors"
                  aria-label="Close notifications"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-bw-muted text-sm">
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-bw-muted text-sm gap-2">
                  <Bell size={24} className="opacity-30" />
                  <span>No rank achievements yet</span>
                </div>
              ) : (
                <ul className="divide-y divide-bw-border">
                  {items.map((notif) => (
                    <NotificationItem key={notif._id} notif={notif} />
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-4 py-2.5 border-t border-bw-border flex-shrink-0 text-center">
                <span className="text-xs text-bw-muted">
                  Showing latest {items.length} notifications
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

/* ── Single notification row ───────────────────────────────────── */
const NotificationItem = memo(function NotificationItem({ notif }) {
  const userName  = notif?.userId?.userName || notif?.userId?.email || 'A user'
  const rankTitle = notif?.rankTitle || notif?.description?.split('updated to ')?.[1] || 'a rank'
  const starKey   = notif?.starKey   || null
  const isUnread  = !notif?.readByAdmin
  const timeAgo   = dayjs(notif?.createdAt).fromNow()

  return (
    <li className={`px-4 py-3 flex gap-3 hover:bg-bw-surface transition-colors ${isUnread ? 'bg-bw-primary/5' : ''}`}>
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-bw-gradient flex items-center justify-center text-white text-sm">
        🏆
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-bw-text leading-snug truncate">
          {userName}
        </p>
        <p className="text-xs text-bw-muted mt-0.5 leading-snug">
          Achieved <span className="text-bw-primary font-medium">{rankTitle}</span>
          {starKey && (
            <span className="ml-1 text-xs">{starBadge(starKey)}</span>
          )}
        </p>
        <p className="text-xs text-bw-muted/60 mt-1">{timeAgo}</p>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-bw-primary" aria-hidden="true" />
      )}
    </li>
  )
})
