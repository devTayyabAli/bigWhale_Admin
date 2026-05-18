import { motion } from 'framer-motion'

/**
 * Full-page loading spinner shown during Suspense fallback.
 */
export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-bw-dark flex items-center justify-center z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-bw-border border-t-bw-primary"
      />
    </div>
  )
}
