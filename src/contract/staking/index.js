/**
 * Staking contract helpers.
 * Migrated from the original project — env vars updated to Vite (VITE_*).
 * react-toastify replaced with react-hot-toast.
 */
import Web3 from 'web3'
import toast from 'react-hot-toast'
import { CONTRACT_DETAILS, CONTRACT_DETAILS_KGC } from '../index'

const RPC_URL = 'https://bnb-mainnet.g.alchemy.com/v2/t2m-k706O1_CKUrV_fIYVVYYdew4oZrx'

/** Get a read-only Web3 instance (no wallet needed) */
export const getWeb3Instance = async () => {
  try {
    return new Web3(RPC_URL)
  } catch (error) {
    toast.error('Failed to connect to Web3')
    console.error('Web3 connection error:', error)
    return null
  }
}

/** Get a wallet-connected Web3 instance */
export const getWeb3 = async () => {
  try {
    if (window?.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      return new Web3(window.ethereum)
    }
    return new Web3(RPC_URL)
  } catch (error) {
    toast.error('Failed to connect to Web3')
    console.error('Web3 connection error:', error)
    return null
  }
}

export const getContractMethods = async (abi, address) => {
  const web3 = await getWeb3()
  return new web3.eth.Contract(abi, address).methods
}

export const connectMetamask = async () => {
  if (!window.ethereum) {
    toast.error('Please install MetaMask')
    return null
  }
  const web3 = await getWeb3()
  const accounts = await web3.eth.getAccounts()
  return accounts[0] || null
}

export const connectWithMetamask = async () => {
  try {
    const web3 = await getWeb3()
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    })
    const accounts = await web3.eth.getAccounts()
    return accounts[0]
  } catch (err) {
    toast.error(err.message)
    return null
  }
}

export const getConnectedAddress = async () => {
  if (!window.ethereum) {
    toast.error('Please install MetaMask')
    return null
  }
  const web3 = await getWeb3()
  const accounts = await web3.eth.getAccounts()
  return accounts[0] || null
}

export const getChainId = async () => {
  const web3 = await getWeb3()
  return web3.eth.getChainId()
}

/** Set the token price on-chain */
export const setTokenPrice = async (price) => {
  try {
    const methods = await getContractMethods(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    )
    const web3 = await getWeb3()
    const address = await connectMetamask()
    return await methods
      .setCurrentPrice(web3.utils.toWei(`${price}`))
      .send({ from: address })
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
}

/** Stake tokens on behalf of a user */
export const stakeTokens = async (address, amount, stakeData, onTransactionHash, onComplete) => {
  try {
    const methods = await getContractMethods(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    )
    const web3 = await getWeb3()
    const connectedAddress = await connectMetamask()

    await methods
      .stakeTokenByOwner(address, web3.utils.toWei(`${amount}`))
      .send({ from: connectedAddress })
      .on('transactionHash', (hash) => onTransactionHash(hash, stakeData))
      .on('receipt', (receipt) => {
        toast.success('Transaction Completed')
        onComplete(receipt)
      })
      .on('error', (error) => toast.error(error?.message))
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }
}

/** Get KGC token amount for a given USDT price */
export const fetchKGCTokens = async (usdtPrice = 100) => {
  try {
    const web3 = await getWeb3Instance()
    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    ).methods
    const connectedAddress = await connectMetamask()
    const tokens = await methods
      .getKGCAmount(web3.utils.toWei(`${usdtPrice || 0}`))
      .call({ from: connectedAddress })
    return web3.utils.fromWei(tokens, 'ether')
  } catch (err) {
    console.error(err)
    return 0
  }
}

/** Convert KGC tokens to USDT value */
export const kgcToUSDT = async (kgc = 0) => {
  try {
    const web3 = await getWeb3Instance()
    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS.staking.abi,
      CONTRACT_DETAILS.staking.address
    ).methods
    const tokens = await methods
      .getKGCPrice(web3.utils.toWei(`${kgc || 0}`))
      .call({})
    return web3.utils.fromWei(tokens, 'ether')
  } catch (err) {
    console.error(err)
    return 0
  }
}

/** Get KGC token balance for an address */
export const kgcBalance = async (address) => {
  try {
    const web3 = await getWeb3Instance()
    const methods = new web3.eth.Contract(
      CONTRACT_DETAILS_KGC.kgc.abi,
      CONTRACT_DETAILS_KGC.kgc.address
    ).methods
    const balance = await methods.balanceOf(address).call({})
    return web3.utils.fromWei(balance, 'ether')
  } catch (err) {
    console.error(err)
    return 0
  }
}
