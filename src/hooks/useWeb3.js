/**
 * useWeb3
 *
 * Legacy wrapper around useWallet for backward compatibility.
 * New code should use `import { useWallet } from '@/context/WalletProvider'`.
 */
import { useWallet } from '@/context/WalletProvider'

export const useWeb3 = () => {
  const wallet = useWallet()

  return {
    // State
    connectedAddress:  wallet.address,
    chainId:           wallet.chainId,
    connected:         wallet.connected,
    isAdmin:           wallet.isAdmin,
    connector:         wallet.connector,
    adminWallet:       import.meta.env.VITE_ADMIN_WALLET_ADDRESS,

    // Actions
    connectWallet:     wallet.connect,
    disconnect:        wallet.disconnect,
    validateChain:     wallet.validateChain,
    ensureAdminWallet: wallet.ensureAdminWallet,

    // Compatibility
    getChainId: async () => wallet.chainId,
  }
}
