import Web3 from 'web3'
import { CONTRACT_DETAILS } from './index'

const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 56)

const RPC_BY_CHAIN = {
  56: 'https://bnb-mainnet.g.alchemy.com/v2/t2m-k706O1_CKUrV_fIYVVYYdew4oZrx',
  97: 'https://bnb-testnet.g.alchemy.com/v2/t2m-k706O1_CKUrV_fIYVVYYdew4oZrx',
}

const FALLBACK_BY_CHAIN = {
  56: 'https://bsc-dataseed1.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
}

const PRIMARY_RPC = RPC_BY_CHAIN[CHAIN_ID] ?? RPC_BY_CHAIN[56]
const FALLBACK_RPC = FALLBACK_BY_CHAIN[CHAIN_ID] ?? FALLBACK_BY_CHAIN[56]

export const ADMIN_WALLET_ADDRESS = (
  import.meta.env.VITE_ADMIN_WALLET_ADDRESS || '0x041c0d8feb4d23e9da3b829fb9c7e450954e0970'
).toLowerCase()

export const MAIN_CONTRACT_ADDRESS =
  import.meta.env.VITE_MAIN_ADDRESS || '0x71083fDeC30Cc092605F158b124A739f446ca118'

/**
 * Safe fallback read helper executing calls across primary & backup RPCs.
 */
async function readCall(fn) {
  for (const rpc of [PRIMARY_RPC, FALLBACK_RPC]) {
    try {
      const web3 = new Web3(rpc)
      const result = await fn(web3)
      return result
    } catch (err) {
      console.warn(`[contractSettings] RPC ${rpc} failed:`, err?.message)
    }
  }
  return null
}

/**
 * Fetch current on-chain Staking limits:
 * - minimumAmount() (wei -> ether/USDT)
 * - maximumAmount() (wei -> ether/USDT)
 */
export async function fetchStakingLimits() {
  const result = await readCall(async (web3) => {
    const contract = new web3.eth.Contract(CONTRACT_DETAILS.staking.abi, MAIN_CONTRACT_ADDRESS)
    const [minWei, maxWei] = await Promise.all([
      contract.methods.minimumAmount().call({}),
      contract.methods.maximumAmount().call({}),
    ])

    return {
      minAmount: minWei ? web3.utils.fromWei(String(minWei), 'ether') : '0',
      maxAmount: maxWei ? web3.utils.fromWei(String(maxWei), 'ether') : '0',
      rawMinWei: String(minWei || '0'),
      rawMaxWei: String(maxWei || '0'),
    }
  })

  return (
    result ?? {
      minAmount: '0',
      maxAmount: '0',
      rawMinWei: '0',
      rawMaxWei: '0',
    }
  )
}

/**
 * Fetch current on-chain Registration Fee:
 * - registerationFee() (wei -> ether/USDT)
 */
export async function fetchRegistrationFee() {
  const result = await readCall(async (web3) => {
    const contract = new web3.eth.Contract(CONTRACT_DETAILS.staking.abi, MAIN_CONTRACT_ADDRESS)
    const feeWei = await contract.methods.registerationFee().call({})
    return {
      feeAmount: feeWei ? web3.utils.fromWei(String(feeWei), 'ether') : '0',
      rawFeeWei: String(feeWei || '0'),
    }
  })

  return result ?? { feeAmount: '0', rawFeeWei: '0' }
}

/**
 * Fetch contract owner address
 */
export async function fetchContractOwner() {
  const result = await readCall(async (web3) => {
    const contract = new web3.eth.Contract(CONTRACT_DETAILS.staking.abi, MAIN_CONTRACT_ADDRESS)
    const owner = await contract.methods.owner().call({})
    return (owner || '').toLowerCase()
  })
  return result ?? ''
}

/**
 * Resolve EIP-1193 Web3 provider from wagmi walletClient or window.ethereum
 */
function resolveWeb3Provider(eip1193Provider) {
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
  if (!provider) {
    throw new Error('No Web3 wallet detected. Please connect MetaMask or your Web3 wallet.')
  }
  return new Web3(provider)
}

/**
 * Verify connected account is the authorized Admin Wallet
 */
async function getVerifiedAdminAddress(web3) {
  const accounts = await web3.eth.getAccounts()
  const connectedAddress = accounts[0] || null

  if (!connectedAddress) {
    throw new Error('No account found. Please connect your Web3 wallet.')
  }

  if (connectedAddress.toLowerCase() !== ADMIN_WALLET_ADDRESS) {
    throw new Error(
      `Unauthorized! Connected wallet (${connectedAddress}) is not the authorized Admin Wallet (${import.meta.env.VITE_ADMIN_WALLET_ADDRESS}).`
    )
  }

  return connectedAddress
}

/**
 * Update Minimum Staking Amount on-chain.
 * Calls setMinimumAmount(uint256 _minimumAmount)
 *
 * @param {string|number} amountStr - Human-readable amount (e.g. "50")
 * @param {object|null} eip1193Provider - wagmi walletClient
 * @param {function|null} onTransactionHash - callback when tx is broadcast
 */
export async function setMinimumStakingAmount(amountStr, eip1193Provider = null, onTransactionHash = null) {
  if (!amountStr || Number(amountStr) <= 0) {
    throw new Error('Please enter a valid positive minimum staking amount.')
  }

  const web3 = resolveWeb3Provider(eip1193Provider)
  const connectedAddress = await getVerifiedAdminAddress(web3)
  const amountWei = web3.utils.toWei(String(amountStr), 'ether')

  const contract = new web3.eth.Contract(CONTRACT_DETAILS.staking.abi, MAIN_CONTRACT_ADDRESS)

  return new Promise((resolve, reject) => {
    contract.methods
      .setMinimumAmount(amountWei)
      .send({ from: connectedAddress })
      .on('transactionHash', (hash) => {
        if (typeof onTransactionHash === 'function') onTransactionHash(hash)
      })
      .on('receipt', (receipt) => resolve(receipt))
      .on('error', (err) => reject(err))
  })
}

/**
 * Update Maximum Staking Amount on-chain.
 * Calls setMaximumAmount(uint256 _maximumAmount)
 *
 * @param {string|number} amountStr - Human-readable amount (e.g. "50000")
 * @param {object|null} eip1193Provider - wagmi walletClient
 * @param {function|null} onTransactionHash - callback when tx is broadcast
 */
export async function setMaximumStakingAmount(amountStr, eip1193Provider = null, onTransactionHash = null) {
  if (!amountStr || Number(amountStr) <= 0) {
    throw new Error('Please enter a valid positive maximum staking amount.')
  }

  const web3 = resolveWeb3Provider(eip1193Provider)
  const connectedAddress = await getVerifiedAdminAddress(web3)
  const amountWei = web3.utils.toWei(String(amountStr), 'ether')

  const contract = new web3.eth.Contract(CONTRACT_DETAILS.staking.abi, MAIN_CONTRACT_ADDRESS)

  return new Promise((resolve, reject) => {
    contract.methods
      .setMaximumAmount(amountWei)
      .send({ from: connectedAddress })
      .on('transactionHash', (hash) => {
        if (typeof onTransactionHash === 'function') onTransactionHash(hash)
      })
      .on('receipt', (receipt) => resolve(receipt))
      .on('error', (err) => reject(err))
  })
}

/**
 * Update Registration Fee on-chain.
 * Calls setRegisterationFee(uint256 _fee) or fallback setRegistrationFee(uint256 _fee)
 *
 * @param {string|number} feeStr - Human-readable fee amount (e.g. "5")
 * @param {object|null} eip1193Provider - wagmi walletClient
 * @param {function|null} onTransactionHash - callback when tx is broadcast
 */
export async function setRegistrationFeeAmount(feeStr, eip1193Provider = null, onTransactionHash = null) {
  if (!feeStr || Number(feeStr) < 0) {
    throw new Error('Please enter a valid non-negative registration fee.')
  }

  const web3 = resolveWeb3Provider(eip1193Provider)
  const connectedAddress = await getVerifiedAdminAddress(web3)
  const feeWei = web3.utils.toWei(String(feeStr), 'ether')

  const contract = new web3.eth.Contract(CONTRACT_DETAILS.staking.abi, MAIN_CONTRACT_ADDRESS)

  // Try setRegisterationFee or setRegistrationFee
  const methodToCall = contract.methods.setRegisterationFee
    ? contract.methods.setRegisterationFee(feeWei)
    : contract.methods.setRegistrationFee(feeWei)

  return new Promise((resolve, reject) => {
    methodToCall
      .send({ from: connectedAddress })
      .on('transactionHash', (hash) => {
        if (typeof onTransactionHash === 'function') onTransactionHash(hash)
      })
      .on('receipt', (receipt) => resolve(receipt))
      .on('error', (err) => reject(err))
  })
}
