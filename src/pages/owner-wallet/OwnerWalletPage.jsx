import { motion } from 'framer-motion'
import PageHeader from '@/components/ui/PageHeader'
import { fadeInUp } from '@/animations'
import OwnerWalletCard from '@/pages/contract-settings/OwnerWalletCard'

export default function OwnerWalletPage() {
  return (
    <motion.div {...fadeInUp} className="space-y-6">
      <PageHeader
        title="Owner Wallet Management"
        subtitle="Securely store, update, and manage the system owner private key in database (AES-256-GCM encrypted)"
      />
      <div className="max-w-4xl">
        <OwnerWalletCard />
      </div>
    </motion.div>
  )
}
