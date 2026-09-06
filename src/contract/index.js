// Contract ABIs and addresses
// ABIs are loaded from JSON files in the respective subdirectories.
// Addresses come from Vite environment variables.

import stakingAbi from './staking/abi.json'
import kgcAbi from './KGC/abi.json'
import usdtAbi from './USDT/abi.json'

export const CONTRACT_DETAILS = {
  staking: {
    abi: stakingAbi,
    address: import.meta.env.VITE_MAIN_ADDRESS || '0x71083fDeC30Cc092605F158b124A739f446ca118',
  },
}

export const CONTRACT_DETAILS_KGC = {
  kgc: {
    abi: kgcAbi,
    address: import.meta.env.VITE_BW_TOKEN_ADDRESS || '0xbD67949cD28CB71bC84a9353687e58BFBC31d296',
  },
}

export const CONTRACT_DETAILS_USDT = {
  usdt: {
    abi: usdtAbi,
    address: import.meta.env.VITE_USDT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955',
  },
}
