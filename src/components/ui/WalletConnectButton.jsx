/**
 * WalletConnectButton
 *
 * Navbar button that drives the Reown AppKit modal.
 *
 * - Not connected  → "Connect Wallet" button → opens AppKit modal (MetaMask,
 *                    WalletConnect QR, Coinbase, all injected wallets, etc.)
 * - Connected      → address chip with connector name, copy, disconnect
 * - Admin wallet   → green accent
 */
import { memo, useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, WifiOff, ChevronDown, Copy, LogOut, Award } from 'react-feather'
import toast from 'react-hot-toast'
import { useWallet } from '@/context/WalletProvider'
import { scaleIn } from '@/animations'

function shortAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default memo(function WalletConnectButton() {
  const { address, connected, isAdmin, connector, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click / Escape
  useEffect(() => {
    const onMouse = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey   = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleCopy = useCallback(() => {
    if (!address) return
    navigator.clipboard.writeText(address)
    toast.success('Address copied!')
    setOpen(false)
  }, [address])

  const handleDisconnect = useCallback(async () => {
    setOpen(false)
    await disconnect()
  }, [disconnect])

  // ── Connected ─────────────────────────────────────────────────────────────
  if (connected && address) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={open}
          title={address}
          className={[
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors duration-200',
            isAdmin
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-bw-surface border-bw-border text-bw-text-secondary hover:border-bw-primary hover:text-bw-primary',
          ].join(' ')}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAdmin ? 'bg-emerald-400' : 'bg-bw-primary'}`} />
          <span className="hidden sm:inline">{shortAddress(address)}</span>
          <Cpu size={12} className="flex-shrink-0" />
          <ChevronDown size={12} className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              {...scaleIn}
              role="menu"
              className="absolute right-0 mt-2 w-60 bw-card py-1 shadow-card-hover origin-top-right z-50"
            >
              <div className="px-4 py-3 border-b border-bw-border">
                {/* Connector name */}
                <p className="text-xs text-bw-muted mb-0.5">{connector ?? 'Connected'}</p>
                {/* Address */}
                <p className="text-sm font-mono font-semibold text-bw-text">{shortAddress(address)}</p>
                {/* Admin badge */}
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-emerald-400 font-medium">
                    <Award size={11} />
                    Admin wallet
                  </span>
                )}
              </div>

              <button
                role="menuitem"
                onClick={handleCopy}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-bw-text-secondary hover:bg-bw-surface hover:text-bw-text transition-colors"
              >
                <Copy size={14} />
                Copy Address
              </button>

              <button
                role="menuitem"
                onClick={handleDisconnect}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Not connected ─────────────────────────────────────────────────────────
  return (
    <button
      onClick={connect}
      className={[
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium',
        'bg-bw-gradient text-white transition-all duration-200',
        'hover:opacity-90 hover:shadow-bw',
      ].join(' ')}
      title="Connect Wallet"
    >
      <WifiOff size={12} />
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  )
})
