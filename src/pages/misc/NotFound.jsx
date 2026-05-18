import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { fadeInUp } from '@/animations'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen min-h-[100dvh] bg-bw-dark flex items-center justify-center p-4">
      <motion.div {...fadeInUp} className="text-center max-w-sm sm:max-w-md w-full">
        {/* Glowing 404 */}
        <div className="relative mb-6 sm:mb-8">
          <p className="text-[80px] sm:text-[120px] font-black leading-none text-gradient select-none">
            404
          </p>
          <div className="absolute inset-0 bg-bw-primary/10 blur-3xl rounded-full -z-10" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-bw-text mb-2">Page Not Found</h1>
        <p className="text-bw-muted text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="secondary" fullWidth>
            Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')} fullWidth>
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
