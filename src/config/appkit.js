/**
 * Reown AppKit configuration — initialised ONCE outside React.
 *
 * Docs: https://docs.reown.com/appkit/react/core/installation
 *
 * Stack: @reown/appkit + @reown/appkit-adapter-wagmi + wagmi v2 + viem
 */
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bsc, bscTestnet } from '@reown/appkit/networks'

// ─── Project ID ───────────────────────────────────────────────────────────────
// Get yours at https://dashboard.reown.com
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
if (!projectId) {
  console.warn('[AppKit] VITE_WALLETCONNECT_PROJECT_ID is not set. Wallet connect modal will not open.')
}

// ─── Active network ───────────────────────────────────────────────────────────
const chainId = Number(import.meta.env.VITE_CHAIN_ID || 56)
export const activeNetwork = chainId === 97 ? bscTestnet : bsc
export const networks = [activeNetwork]

// ─── App metadata ─────────────────────────────────────────────────────────────
const metadata = {
  name: 'BW Admin',
  description: 'BigWhale Admin Panel',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://admin.bigwhale.io',
  icons: ['https://admin.bigwhale.io/favicon.ico'],
}

// ─── Wagmi adapter ────────────────────────────────────────────────────────────
// Includes WalletConnect, Injected (MetaMask / browser wallets) and Coinbase
// connectors automatically — no manual connector setup needed.
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false, // Vite / CSR app
})

// ─── Create AppKit modal ──────────────────────────────────────────────────────
createAppKit({
  adapters:  [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics:   false,
    email:       false,   // disable email/social login — admin only
    socials:     false,
    onramp:      false,
    swaps:       false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent':           '#7C3AED',
    '--w3m-border-radius-master': '12px',
  },
})
