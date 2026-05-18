import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'react-feather'
import { scaleIn } from '@/animations'

/**
 * BW themed modal.
 * - Full-screen on mobile (bottom sheet style), centered on sm+
 * - Max height with scroll for long content
 * - Keyboard accessible (Escape to close)
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const sizeMap = {
    sm:  'sm:max-w-sm',
    md:  'sm:max-w-md',
    lg:  'sm:max-w-lg',
    xl:  'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        /* Full-screen overlay */
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel — bottom sheet on mobile, centered card on sm+ */}
          <motion.div
            {...scaleIn}
            className={[
              'relative w-full bw-card shadow-card-hover z-10',
              /* Mobile: full width, rounded top corners, max 90vh */
              'rounded-b-none sm:rounded-2xl',
              'max-h-[90vh] flex flex-col',
              /* Desktop: constrained width */
              sizeMap[size],
              /* Horizontal padding on mobile */
              'mx-0 sm:mx-4',
              className,
            ].join(' ')}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-bw-border flex-shrink-0">
                <h3 id="modal-title" className="text-base font-semibold text-bw-text">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-bw-muted hover:text-bw-text hover:bg-bw-surface transition-colors"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Scrollable body */}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col-reverse sm:flex-row items-stretch sm:items-center',
        'justify-end gap-2 sm:gap-3 pt-4 border-t border-bw-border mt-4',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
