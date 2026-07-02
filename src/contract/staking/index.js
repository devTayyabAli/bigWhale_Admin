/**
 * Staking / Main contract helpers (updated for new BW ABI).
 *
 * Contract function mapping (old → new):
 *   currentKGCPrice()          → currentBWPrice()
 *   getKGCAmount(usdtWei)      → getBWAmount(usdtWei)
 *   getKGCPrice(bwWei)         → getBWPrice(bwWei)
 *   setCurrentPrice(newPrice)  → setCurrentPrice(newPrice)   (same)
 *   stakeTokenByOwner(addr, n) → stakeTokenByOwner(addr, n)  (same)
 */
import Web3 from 'web3'
import toast from 'react-hot-toast'
import { CONTRACT_DETAILS, CONTRACT_DETAILS_KGC } from '../index'

// ─── RPC configuration ────────────────────────────────────────────────────────
// Contract address 0xb477D056... is deployed on BSC Testnet (chain 97).
// VITE_CHAIN_ID=97 confirms this. Use testnet RPC for all calls.
const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 97)

const RPC_BY_CHAIN = {
  56: 'https://bnb-mainnet.g.alchemy.com/v2/t2m-k706O1_CKUrV_fIYVVYYdew4oZrx',
  97: 'https://bnb-testnet.g.alchemy.com/v2/t2m-k706O1_CKUrV_fIYVVYYdew4oZrx',
}
const FALLBACK_BY_CHAIN = {
  56: 'https://bsc-dataseed1.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
}

const PRIMARY_RPC  = RPC_BY_CHAIN[CHAIN_ID]  ?? RPC_BY_CHAIN[97]
const FALLBACK_RPC = FALLBACK_BY_CHAIN[CHAIN_ID] ?? FALLBACK_BY_CHAIN[97]

const ADMIN_WALLET = (import.meta.env.VITE_ADMIN_WALLET_ADDRESS || '').toLowerCase()

// ─── Provider helpers ─────────────────────────────────────────────────────────

/** Read-only Web3 instance (chain-aware) */
export const getWeb3Instance = async () => {
  try {
    return new Web3(PRIMARY_RPC)
  } catch (error) {
    toast.error('Failed to connect to Web3')
    console.error('Web3 connection error:', error)
    return null
  }
}

export const getWeb3 = async (eip1193Provider = null) => {
  try {
    const provider = eip1193Provider ?? window?.ethereum ?? PRIMARY_RPC
    return new Web3(provider)
  } catch (error) {
    toast.error('Failed to connect to Web3')
    console.error('Web3 connection error:', error)
    return null
  }
}

export const getContractMethods = async (abi, address, eip1193Provider = null) => {
  const web3 = await getWeb3(eip1193Provider)
  return new web3.eth.Contract(abi, address).methods
}

export const getConnectedAddress = async (eip1193Provider = null) => {
  const provider = eip1193Provider ?? window?.ethereum
  if (!provider) return null
  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()
  return accounts[0] || null
}

export const getChainId = async (eip1193Provider = null) => {
  const web3 = await getWeb3(eip1193Provider)
  return web3.eth.getChainId()
}

export const connectMetamask = async () => {
  if (!window.ethereum) {
    toast.error('Please install MetaMask')
    return null
  }
  await window.ethereum.request({ method: 'eth_requestAccounts' })
  const web3 = new Web3(window.ethereum)
  const accounts = await web3.eth.getAccounts()
  return accounts[0] || null
}

// ─── Read helpers (with RPC fallback) ────────────────────────────────────────

/** Run a read-only call, trying primary RPC then public fallback */
async function readCall(fn) {
  for (const rpc of [PRIMARY_RPC, FALLBACK_RPC]) {
    try {
      const result = await fn(new Web3(rpc))
      return result
    } catch (err) {
      console.warn(`[contract] RPC ${rpc} failed:`, err?.message)
    }
  }
  return null
}

// ─── Price & amount helpers ───────────────────────────────────────────────────

/**
 * Fetch current BW token price from contract.
 * currentBWPrice() → uint256 (USDT wei per 1 BW token)
 * Returns price as a JS number in ether units (e.g. 0.01 = $0.01 per BW).
 */
export const fetchBWPrice = async () => {
  const result = await readCall(async (web3) => {
    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    ).methods
    const priceWei = await methods.currentBWPrice().call({})
    return parseFloat(web3.utils.fromWei(String(priceWei), 'ether'))
  })
  return result ?? 0
}

/**
 * Get BW token amount for a given USDT amount.
 * getBWAmount(usdtAmountInWei) → uint256 (BW wei)
 */
export const fetchBWTokens = async (usdtAmount = 100) => {
  const result = await readCall(async (web3) => {
    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    ).methods
    const bwWei = await methods
      .getBWAmount(web3.utils.toWei(`${usdtAmount || 0}`))
      .call({ from: ADMIN_WALLET })
    return web3.utils.fromWei(String(bwWei), 'ether')
  })
  return result ?? 0
}

/**
 * Get USDT value for a given BW amount.
 * getBWPrice(bwAmountInWei) → uint256 (USDT wei)
 */
export const bwToUSDT = async (bw = 0) => {
  const result = await readCall(async (web3) => {
    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    ).methods
    const usdtWei = await methods
      .getBWPrice(web3.utils.toWei(`${bw || 0}`))
      .call({})
    return web3.utils.fromWei(String(usdtWei), 'ether')
  })
  return result ?? 0
}

/** BW token balance for an address */
export const bwBalance = async (address) => {
  const result = await readCall(async (web3) => {
    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS_KGC.kgc.abi,
      CONTRACT_DETAILS_KGC.kgc.address
    ).methods
    const balWei = await methods.balanceOf(address).call({})
    return web3.utils.fromWei(String(balWei), 'ether')
  })
  return result ?? 0
}

// ─── Legacy aliases (keep old callers working) ───────────────────────────────
export const fetchKGCTokens = fetchBWTokens
export const kgcToUSDT      = bwToUSDT
export const kgcBalance     = bwBalance

// ─── Contract write functions ─────────────────────────────────────────────────

/**
 * Set the BW token price on-chain.
 * setCurrentPrice(newPrice) — same function name, now sets BW price.
 */
export const setTokenPrice = async (price, eip1193Provider = null) => {
  try {
    const provider = eip1193Provider ?? window?.ethereum
    if (!provider) throw new Error('No wallet connected. Please connect your wallet first.')

    const web3    = new Web3(provider)
    const address = await getConnectedAddress(provider)
    if (!address) throw new Error('No account found. Please connect your wallet.')

    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    ).methods

    return await methods
      .setCurrentPrice(web3.utils.toWei(`${price}`))
      .send({ from: address })
  } catch (err) {
    console.error(err)
    throw new Error(err?.message || String(err))
  }
}

/**
 * Stake BW tokens on behalf of a user.
 * stakeTokenByOwner(address, amount) — same function name.
 *
 * @param {object|null} eip1193Provider - Pass wagmi's walletClient directly.
 *   wagmi v2 walletClient has a `.transport.request` method that is EIP-1193
 *   compatible. We wrap it in a Web3 provider shim to keep using web3.js.
 */
export const stakeTokens = async (
  userAddress,
  amount,
  stakeData,
  onTransactionHash,
  onComplete,
  eip1193Provider = null
) => {
  try {
    // Resolve the best available EIP-1193 provider:
    // 1. wagmi walletClient (from Reown AppKit — preferred, avoids Phantom)
    // 2. window.ethereum fallback
    let provider = null
    if (eip1193Provider) {
      // wagmi v2 walletClient exposes EIP-1193 via .transport
      // Check if it has a .request method directly (standard EIP-1193)
      if (typeof eip1193Provider.request === 'function') {
        provider = eip1193Provider
      } else if (eip1193Provider.transport?.request) {
        // wagmi walletClient wraps transport — use it as the provider
        provider = {
          request: (args) => eip1193Provider.transport.request(args),
        }
      }
    }
    if (!provider) provider = window?.ethereum ?? null
    if (!provider) throw new Error('No wallet connected. Please connect your wallet first.')

    const web3             = new Web3(provider)
    const connectedAddress = await getConnectedAddress(provider)
    if (!connectedAddress) throw new Error('No account found. Please connect your wallet.')

    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    ).methods

    await methods
      .stakeTokenByOwner(userAddress, web3.utils.toWei(`${amount}`))
      .send({ from: connectedAddress })
      .on('transactionHash', (hash) => onTransactionHash(hash, stakeData))
      .on('receipt', (receipt) => {
        toast.success('Transaction Completed')
        onComplete(receipt)
      })
      .on('error', (error) => {
        toast.error(error?.message || 'Transaction failed')
        throw error
      })
  } catch (err) {
    console.error(err)
    throw new Error(err?.message || String(err))
  }
}
