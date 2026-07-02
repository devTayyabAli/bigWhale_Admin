/**
 * WalletProvider
 *
 * Wraps the app with wagmi's WagmiProvider (required by Reown AppKit).
 * Also exposes a lightweight WalletContext with admin-specific helpers so
 * the rest of the app doesn't need to import wagmi directly.
 *
 * Docs: https://docs.reown.com/appkit/react/core/installation
 */
import { createContext, useContext, useMemo, useCallback, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import toast from 'react-hot-toast'
import { wagmiAdapter } from '@/config/appkit'

// ─── Constants ────────────────────────────────────────────────────────────────
const REQUIRED_CHAIN = Number(import.meta.env.VITE_CHAIN_ID || 56)
const ADMIN_WALLET   = (import.meta.env.VITE_ADMIN_WALLET_ADDRESS || '').toLowerCase()

const CHAIN_NAMES = { 56: 'BNB Smart Chain', 97: 'BSC Testnet' }

// ─── Context ──────────────────────────────────────────────────────────────────
const WalletContext = createContext(null)

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>')
  return ctx
}

// ─── Inner consumer — must live inside WagmiProvider ─────────────────────────
function WalletContextProvider({ children }) {
  const { address, isConnected, connector } = useAccount()
  const { disconnect: wagmiDisconnect }      = useDisconnect()
  const chainId                              = useChainId()
  const { open }                             = useAppKit()   // opens the AppKit modal

  const normalizedAddress = address?.toLowerCase() ?? null
  const isAdmin = !!normalizedAddress && normalizedAddress === ADMIN_WALLET

  // ── AUTO-DISCONNECT non-admin wallets ────────────────────────────────────
  // If a wallet connects and it's NOT the admin wallet, disconnect immediately.
  useEffect(() => {
    if (isConnected && normalizedAddress && !isAdmin) {
      wagmiDisconnect()
      toast.error(
        `Only the admin wallet is allowed: ${ADMIN_WALLET.slice(0, 6)}…${ADMIN_WALLET.slice(-4)}`
      )
    }
  }, [isConnected, normalizedAddress, isAdmin, wagmiDisconnect])

  // ── Open AppKit modal to connect ─────────────────────────────────────────
  const connect = useCallback(async () => {
    await open()
  }, [open])

  // ── Disconnect ────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    wagmiDisconnect()
    toast.success('Wallet disconnected.')
  }, [wagmiDisconnect])

  // ── Validate the active chain ─────────────────────────────────────────────
  const validateChain = useCallback(() => {
    if (chainId !== REQUIRED_CHAIN) {
      toast.error(`Please switch to ${CHAIN_NAMES[REQUIRED_CHAIN] || 'the correct network'}.`)
      return false
    }
    return true
  }, [chainId])

  // ── Ensure admin wallet is connected ─────────────────────────────────────
  const ensureAdminWallet = useCallback(async () => {
    if (!isConnected) {
      await open()
      return false // modal is async — caller should re-check after modal closes
    }
    if (!isAdmin) {
      toast.error(
        `Connect with admin wallet: ${ADMIN_WALLET.slice(0, 6)}…${ADMIN_WALLET.slice(-4)}`
      )
      return false
    }
    return normalizedAddress
  }, [isConnected, isAdmin, normalizedAddress, open])

  const value = useMemo(() => ({
    // State
    address:    normalizedAddress,
    chainId,
    connected:  isConnected,
    isAdmin,
    connector:  connector?.name ?? null,

    // Actions
    connect,
    disconnect,
    validateChain,
    ensureAdminWallet,
    openModal: open,
  }), [
    normalizedAddress, chainId, isConnected, isAdmin, connector,
    connect, disconnect, validateChain, ensureAdminWallet, open,
  ])

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// ─── Public provider (wraps WagmiProvider + context) ─────────────────────────
export default function WalletProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount>
      <WalletContextProvider>
        {children}
      </WalletContextProvider>
    </WagmiProvider>
  )
}
