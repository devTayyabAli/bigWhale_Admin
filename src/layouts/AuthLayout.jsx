import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeIn } from '@/animations'

/**
 * Full-page auth layout.
 * - Gradient orbs scale down on mobile
 * - Content is vertically centered with safe padding
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-bw-darker flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background gradient orbs — smaller on mobile */}
      <div className="absolute top-[-10%] left-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-bw-primary/5 blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-bw-secondary/5 blur-[80px] sm:blur-[120px] pointer-events-none" />

      <motion.div {...fadeIn} className="relative z-10 w-full max-w-sm sm:max-w-md">
        <Outlet />
      </motion.div>
    </div>
  )
}
