// Contract ABIs and addresses
// ABIs are loaded from JSON files in the respective subdirectories.
// Addresses come from Vite environment variables.

import stakingAbi from './staking/abi.json'
import kgcAbi from './KGC/abi.json'

export const CONTRACT_DETAILS = {
  staking: {
    abi: stakingAbi,
    address: import.meta.env.VITE_MAIN_ADDRESS,
  },
}

export const CONTRACT_DETAILS_KGC = {
  kgc: {
    abi: kgcAbi,
    address: '0x5C76F44a5B2d6B085486Fd645A7982b3928F80bC',
  },
}
