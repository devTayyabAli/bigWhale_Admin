import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET_ADDRESS
const REQUIRED_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 56)

const CHAIN_NAMES = {
  97: 'Binance Testnet',
  56: 'Binance Mainnet',
}

/**
 * Hook for MetaMask / Web3 interactions.
 * Provides wallet connection, chain validation, and address helpers.
 */
export const useWeb3 = () => {
  const [connectedAddress, setConnectedAddress] = useState(null)
  const [chainId, setChainId] = useState(null)

  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) return window.ethereum
    toast.error('MetaMask not detected. Please install MetaMask.')
    return null
  }, [])

  const connectWallet = useCallback(async () => {
    const provider = getProvider()
    if (!provider) return null
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]?.toLowerCase()
      setConnectedAddress(address)
      return address
    } catch (err) {
      toast.error('Wallet connection rejected.')
      return null
    }
  }, [getProvider])

  const getChainId = useCallback(async () => {
    const provider = getProvider()
    if (!provider) return null
    const hex = await provider.request({ method: 'eth_chainId' })
    const id = parseInt(hex, 16)
    setChainId(id)
    return id
  }, [getProvider])

  const validateChain = useCallback(async () => {
    const id = await getChainId()
    if (id !== REQUIRED_CHAIN_ID) {
      toast.error(`Please connect to ${CHAIN_NAMES[REQUIRED_CHAIN_ID] || 'the correct network'}`)
      return false
    }
    return true
  }, [getChainId])

  const ensureAdminWallet = useCallback(async () => {
    let address = connectedAddress
    if (!address) {
      address = await connectWallet()
    }
    if (!address) return false
    if (address.toLowerCase() !== ADMIN_WALLET?.toLowerCase()) {
      toast.error(
        `Please connect with admin wallet: ${ADMIN_WALLET?.slice(0, 6)}...${ADMIN_WALLET?.slice(-4)}`
      )
      return false
    }
    return address
  }, [connectedAddress, connectWallet])

  return {
    connectedAddress,
    chainId,
    connectWallet,
    getChainId,
    validateChain,
    ensureAdminWallet,
    adminWallet: ADMIN_WALLET,
  }
}
