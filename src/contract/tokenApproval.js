import Web3 from 'web3'
import toast from 'react-hot-toast'
import { CONTRACT_DETAILS_KGC, CONTRACT_DETAILS_USDT } from './index'

const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 56)

const RPC_BY_CHAIN = {
  56: 'https://bnb-mainnet.g.alchemy.com/v2/t2m-k706O1_CKUrV_fIYVVYYdew4oZrx',
  97: 'https://bnb-testnet.g.alchemy.com/v2/t2m-k706O1_CKUrV_fIYVVYYdew4oZrx',
}

const FALLBACK_BY_CHAIN = {
  56: 'https://bsc-dataseed1.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
}

const PRIMARY_RPC  = RPC_BY_CHAIN[CHAIN_ID]  ?? RPC_BY_CHAIN[56]
const FALLBACK_RPC = FALLBACK_BY_CHAIN[CHAIN_ID] ?? FALLBACK_BY_CHAIN[56]

export const ADMIN_WALLET_ADDRESS = (import.meta.env.VITE_ADMIN_WALLET_ADDRESS || '0x041c0d8feb4d23e9da3b829fb9c7e450954e0970').toLowerCase()

/** Helper to select token contract info by token type ('BW' | 'USDT') */
export function getTokenContractInfo(tokenType) {
  if (tokenType === 'USDT') {
    return {
      abi: CONTRACT_DETAILS_USDT.usdt.abi,
      address: CONTRACT_DETAILS_USDT.usdt.address,
      symbol: 'USDT',
    }
  }
  return {
    abi: CONTRACT_DETAILS_KGC.kgc.abi,
    address: CONTRACT_DETAILS_KGC.kgc.address,
    symbol: 'BW',
  }
}

/** Fallback read call across primary & fallback RPC */
async function readCall(fn) {
  for (const rpc of [PRIMARY_RPC, FALLBACK_RPC]) {
    try {
      const result = await fn(new Web3(rpc))
      return result
    } catch (err) {
      console.warn(`[tokenApproval] RPC ${rpc} failed:`, err?.message)
    }
  }
  return null
}

/** Fetch current allowance granted by owner to spender */
export async function fetchAllowance(tokenType, ownerAddress, spenderAddress) {
  if (!ownerAddress || !spenderAddress) return '0'
  const tokenInfo = getTokenContractInfo(tokenType)
  
  const result = await readCall(async (web3) => {
    const contract = new web3.eth.Contract(tokenInfo.abi, tokenInfo.address)
    const allowanceWei = await contract.methods.allowance(ownerAddress, spenderAddress).call({})
    return web3.utils.fromWei(String(allowanceWei), 'ether')
  })
  return result ?? '0'
}

/** Fetch wallet token balance */
export async function fetchTokenBalance(tokenType, walletAddress) {
  if (!walletAddress) return '0'
  const tokenInfo = getTokenContractInfo(tokenType)

  const result = await readCall(async (web3) => {
    const contract = new web3.eth.Contract(tokenInfo.abi, tokenInfo.address)
    const balanceWei = await contract.methods.balanceOf(walletAddress).call({})
    return web3.utils.fromWei(String(balanceWei), 'ether')
  })
  return result ?? '0'
}

/**
 * Execute Token Approval on-chain.
 * Strict check: Throws error if connected wallet is not the Admin Wallet.
 */
export async function approveTokenContract(
  tokenType,
  spenderAddress,
  amountStr,
  eip1193Provider = null,
  onTransactionHash = null
) {
  const tokenInfo = getTokenContractInfo(tokenType)

  // Resolve EIP-1193 provider
  let provider = null
  if (eip1193Provider) {
    if (typeof eip1193Provider.request === 'function') {
      provider = eip1193Provider
    } else if (eip1193Provider.transport?.request) {
      provider = {
        request: (args) => eip1193Provider.transport.request(args),
      }
    }
  }
  if (!provider) provider = window?.ethereum ?? null
  if (!provider) throw new Error('No wallet connected. Please connect your Web3 wallet.')

  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()
  const connectedAddress = accounts[0] || null

  if (!connectedAddress) {
    throw new Error('No account found. Please connect your Web3 wallet.')
  }

  // Strict Admin Check
  if (connectedAddress.toLowerCase() !== ADMIN_WALLET_ADDRESS) {
    throw new Error(`Unauthorized! Connected wallet (${connectedAddress}) is not the designated Admin Wallet (${import.meta.env.VITE_ADMIN_WALLET_ADDRESS}).`)
  }

  // Calculate Wei Value
  let valueWei
  if (amountStr === 'unlimited' || amountStr === 'max') {
    valueWei = '115792089237316195423570985008687907853269984665640564039457584007913129639935' // 2^256 - 1
  } else {
    valueWei = web3.utils.toWei(`${amountStr || 0}`, 'ether')
  }

  const contract = new web3.eth.Contract(tokenInfo.abi, tokenInfo.address)

  return new Promise((resolve, reject) => {
    contract.methods
      .approve(spenderAddress, valueWei)
      .send({ from: connectedAddress })
      .on('transactionHash', (hash) => {
        if (typeof onTransactionHash === 'function') {
          onTransactionHash(hash)
        }
      })
      .on('receipt', (receipt) => {
        resolve(receipt)
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}
