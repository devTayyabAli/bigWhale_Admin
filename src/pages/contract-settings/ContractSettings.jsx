import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  RefreshCw,
  Sliders,
  DollarSign,
  CheckCircle,
  ExternalLink,
  TrendingUp,
  UserPlus,
  Info,
  Lock,
  ArrowRight,
} from 'react-feather'
import toast from 'react-hot-toast'
import { useAccount, useWalletClient } from 'wagmi'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import OwnerWalletCard from './OwnerWalletCard'
import { useWallet } from '@/context/WalletProvider'
import { fadeInUp } from '@/animations'
import {
  fetchStakingLimits,
  fetchRegistrationFee,
  fetchContractOwner,
  setMinimumStakingAmount,
  setMaximumStakingAmount,
  setRegistrationFeeAmount,
  ADMIN_WALLET_ADDRESS,
  MAIN_CONTRACT_ADDRESS,
} from '@/contract/contractSettings'

export default function ContractSettings() {
  const { address: connectedAddress, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { validateChain } = useWallet()

  // Live on-chain contract state
  const [currentMinAmount, setCurrentMinAmount] = useState('0')
  const [currentMaxAmount, setCurrentMaxAmount] = useState('0')
  const [currentRegFee, setCurrentRegFee] = useState('0')
  const [contractOwner, setContractOwner] = useState('')
  const [fetchingData, setFetchingData] = useState(false)

  // Staking Limits Form State
  const [minInput, setMinInput] = useState('')
  const [maxInput, setMaxInput] = useState('')
  const [minError, setMinError] = useState('')
  const [maxError, setMaxError] = useState('')
  const [submittingMin, setSubmittingMin] = useState(false)
  const [submittingMax, setSubmittingMax] = useState(false)
  const [txHashMin, setTxHashMin] = useState(null)
  const [txHashMax, setTxHashMax] = useState(null)

  // Registration Fee Form State
  const [feeInput, setFeeInput] = useState('')
  const [feeError, setFeeError] = useState('')
  const [submittingFee, setSubmittingFee] = useState(false)
  const [txHashFee, setTxHashFee] = useState(null)

  const isAdminConnected = Boolean(
    isConnected &&
      connectedAddress &&
      (connectedAddress.toLowerCase() === ADMIN_WALLET_ADDRESS ||
        (contractOwner && connectedAddress.toLowerCase() === contractOwner.toLowerCase()))
  )

  // Load all live on-chain values
  const loadContractData = useCallback(async () => {
    setFetchingData(true)
    try {
      const [limits, feeData, owner] = await Promise.all([
        fetchStakingLimits(),
        fetchRegistrationFee(),
        fetchContractOwner(),
      ])

      setCurrentMinAmount(limits.minAmount)
      setCurrentMaxAmount(limits.maxAmount)
      setCurrentRegFee(feeData.feeAmount)
      setContractOwner(owner)

      // Pre-fill inputs if empty
      setMinInput((prev) => (prev === '' ? limits.minAmount : prev))
      setMaxInput((prev) => (prev === '' ? limits.maxAmount : prev))
      setFeeInput((prev) => (prev === '' ? feeData.feeAmount : prev))
    } catch (err) {
      console.error('[ContractSettings] Failed to fetch contract parameters:', err)
      toast.error('Failed to read contract values from blockchain')
    } finally {
      setFetchingData(false)
    }
  }, [])

  useEffect(() => {
    loadContractData()
  }, [loadContractData])

  // Handle Update Minimum Staking Amount
  const handleUpdateMinAmount = async (e) => {
    e?.preventDefault()
    setMinError('')
    setTxHashMin(null)

    const val = parseFloat(minInput)
    if (!minInput || isNaN(val) || val <= 0) {
      setMinError('Please enter a valid positive minimum amount')
      return
    }

    const currentMax = parseFloat(currentMaxAmount)
    if (currentMax > 0 && val > currentMax) {
      setMinError(`Minimum amount cannot exceed maximum amount ($${currentMax.toLocaleString()})`)
      return
    }

    if (!validateChain()) return
    if (!isConnected || !connectedAddress) {
      toast.error('Please connect your Web3 wallet first.')
      return
    }
    if (!isAdminConnected) {
      toast.error(`Unauthorized! Only the Admin Wallet can update staking amounts.`)
      return
    }

    setSubmittingMin(true)
    const provider = walletClient ?? window?.ethereum ?? null

    try {
      const receipt = await setMinimumStakingAmount(minInput, provider, (hash) => {
        setTxHashMin(hash)
        toast.loading(`Updating Min Amount... Tx: ${hash.slice(0, 10)}...`, { id: 'min-tx' })
      })

      if (receipt?.status) {
        toast.success(`Minimum Staking Amount updated to ${minInput} USDT!`, { id: 'min-tx' })
        await loadContractData()
      } else {
        toast.error('Transaction failed or reverted on-chain.', { id: 'min-tx' })
      }
    } catch (err) {
      console.error('[ContractSettings] Update Min Amount Error:', err)
      toast.error(err?.message || 'Failed to update minimum amount', { id: 'min-tx' })
    } finally {
      setSubmittingMin(false)
    }
  }

  // Handle Update Maximum Staking Amount
  const handleUpdateMaxAmount = async (e) => {
    e?.preventDefault()
    setMaxError('')
    setTxHashMax(null)

    const val = parseFloat(maxInput)
    if (!maxInput || isNaN(val) || val <= 0) {
      setMaxError('Please enter a valid positive maximum amount')
      return
    }

    const currentMin = parseFloat(currentMinAmount)
    if (currentMin > 0 && val < currentMin) {
      setMaxError(`Maximum amount cannot be lower than minimum amount ($${currentMin.toLocaleString()})`)
      return
    }

    if (!validateChain()) return
    if (!isConnected || !connectedAddress) {
      toast.error('Please connect your Web3 wallet first.')
      return
    }
    if (!isAdminConnected) {
      toast.error(`Unauthorized! Only the Admin Wallet can update staking amounts.`)
      return
    }

    setSubmittingMax(true)
    const provider = walletClient ?? window?.ethereum ?? null

    try {
      const receipt = await setMaximumStakingAmount(maxInput, provider, (hash) => {
        setTxHashMax(hash)
        toast.loading(`Updating Max Amount... Tx: ${hash.slice(0, 10)}...`, { id: 'max-tx' })
      })

      if (receipt?.status) {
        toast.success(`Maximum Staking Amount updated to ${maxInput} USDT!`, { id: 'max-tx' })
        await loadContractData()
      } else {
        toast.error('Transaction failed or reverted on-chain.', { id: 'max-tx' })
      }
    } catch (err) {
      console.error('[ContractSettings] Update Max Amount Error:', err)
      toast.error(err?.message || 'Failed to update maximum amount', { id: 'max-tx' })
    } finally {
      setSubmittingMax(false)
    }
  }

  // Handle Update Registration Fee
  const handleUpdateRegFee = async (e) => {
    e?.preventDefault()
    setFeeError('')
    setTxHashFee(null)

    const val = parseFloat(feeInput)
    if (feeInput === '' || isNaN(val) || val < 0) {
      setFeeError('Please enter a valid non-negative registration fee')
      return
    }

    if (!validateChain()) return
    if (!isConnected || !connectedAddress) {
      toast.error('Please connect your Web3 wallet first.')
      return
    }
    if (!isAdminConnected) {
      toast.error(`Unauthorized! Only the Admin Wallet can update the registration fee.`)
      return
    }

    setSubmittingFee(true)
    const provider = walletClient ?? window?.ethereum ?? null

    try {
      const receipt = await setRegistrationFeeAmount(feeInput, provider, (hash) => {
        setTxHashFee(hash)
        toast.loading(`Updating Registration Fee... Tx: ${hash.slice(0, 10)}...`, { id: 'fee-tx' })
      })

      if (receipt?.status) {
        toast.success(`Registration Fee updated to ${feeInput} USDT!`, { id: 'fee-tx' })
        await loadContractData()
      } else {
        toast.error('Transaction failed or reverted on-chain.', { id: 'fee-tx' })
      }
    } catch (err) {
      console.error('[ContractSettings] Update Registration Fee Error:', err)
      toast.error(
        err?.message ||
          'Failed to update registration fee. If the contract requires upgrading, please verify the implementation function.',
        { id: 'fee-tx', duration: 6000 }
      )
    } finally {
      setSubmittingFee(false)
    }
  }

  return (
    <motion.div {...fadeInUp} className="space-y-6">
      <PageHeader
        title="Contract Settings"
        subtitle="Manage on-chain Staking Limits (Min & Max Amount) and Registration Fee on BSC Mainnet (Chain 56)"
      />

      {/* Admin Authorization Guard Banner */}
      <Card
        className={`border ${
          isAdminConnected
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-amber-500/30 bg-amber-500/5'
        }`}
      >
        <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isAdminConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isAdminConnected ? <Shield size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div>
              <h3 className="font-bold text-bw-text text-base flex items-center gap-2">
                <span>Admin Wallet Authorization</span>
                {isAdminConnected ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    Authorized Admin
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                    Unauthorized / Disconnected
                  </span>
                )}
              </h3>
              <p className="text-xs text-bw-muted mt-1">
                Designated Admin: <code className="text-bw-primary font-mono select-all">{import.meta.env.VITE_ADMIN_WALLET_ADDRESS}</code>
              </p>
              {connectedAddress && !isAdminConnected && (
                <p className="text-xs text-red-400 font-medium mt-1">
                  Connected Wallet: <code className="font-mono">{connectedAddress}</code>. Only the designated Admin Wallet can execute contract modifications.
                </p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadContractData}
            loading={fetchingData}
            className="flex-shrink-0"
          >
            <RefreshCw size={14} className={fetchingData ? 'animate-spin' : ''} />
            Refresh Parameters
          </Button>
        </CardBody>
      </Card>

      {/* 3 Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Min Staking Limit */}
        <Card className="border border-bw-border hover:border-bw-primary/40 transition-all">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">
                Minimum Stake
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono text-bw-text">
                {parseFloat(currentMinAmount).toLocaleString()} <span className="text-sm font-normal text-bw-muted">USDT</span>
              </div>
              <p className="text-xs text-bw-muted mt-1 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-400" />
                Live on BSC Mainnet
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Max Staking Limit */}
        <Card className="border border-bw-border hover:border-bw-primary/40 transition-all">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">
                Maximum Stake
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Sliders size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono text-bw-text">
                {parseFloat(currentMaxAmount).toLocaleString()} <span className="text-sm font-normal text-bw-muted">USDT</span>
              </div>
              <p className="text-xs text-bw-muted mt-1 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-400" />
                Live on BSC Mainnet
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Registration Fee */}
        <Card className="border border-bw-border hover:border-bw-primary/40 transition-all">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">
                Registration Fee
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <UserPlus size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold font-mono text-bw-text">
                {parseFloat(currentRegFee).toLocaleString()} <span className="text-sm font-normal text-bw-muted">USDT</span>
              </div>
              <p className="text-xs text-bw-muted mt-1 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-400" />
                Paid once per user signup
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Forms Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Staking Amount Limits Management */}
        <Card>
          <CardHeader
            title="Staking Amount Limits"
            subtitle="Change on-chain Minimum and Maximum staking amounts"
            actions={
              <span className="text-xs font-mono px-2 py-1 rounded bg-bw-surface border border-bw-border text-bw-muted">
                setMinimumAmount / setMaximumAmount
              </span>
            }
          />
          <CardBody className="space-y-5">
            <div className="p-3.5 rounded-xl bg-bw-surface border border-bw-border text-xs text-bw-muted flex items-start gap-2.5">
              <Info size={16} className="text-bw-primary flex-shrink-0 mt-0.5" />
              <span>
                These values are stored directly on the BigWhale Staking Smart Contract and enforce staking boundaries across both the User Portal and Admin Panel.
              </span>
            </div>

            {/* Min Staking Input & Button */}
            <div className="space-y-2 p-4 rounded-xl bg-bw-surface/50 border border-bw-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-bw-text">Minimum Staking Amount (USDT)</label>
                <span className="text-xs text-bw-muted">Current: <span className="text-bw-primary font-mono font-bold">${currentMinAmount}</span></span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="Enter new min amount (e.g. 50)"
                    value={minInput}
                    onChange={(e) => {
                      setMinInput(e.target.value)
                      setMinError('')
                    }}
                    error={minError}
                    disabled={submittingMin}
                  />
                </div>
                <Button
                  onClick={handleUpdateMinAmount}
                  loading={submittingMin}
                  disabled={!isAdminConnected || submittingMin}
                  className="whitespace-nowrap sm:w-auto"
                >
                  {submittingMin ? 'Updating...' : 'Update Min'}
                </Button>
              </div>

              {txHashMin && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs mt-2">
                  <span className="text-bw-muted font-mono truncate max-w-[200px]">Tx: {txHashMin}</span>
                  <a
                    href={`https://bscscan.com/tx/${txHashMin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:underline font-medium"
                  >
                    View on BscScan <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Max Staking Input & Button */}
            <div className="space-y-2 p-4 rounded-xl bg-bw-surface/50 border border-bw-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-bw-text">Maximum Staking Amount (USDT)</label>
                <span className="text-xs text-bw-muted">Current: <span className="text-bw-primary font-mono font-bold">${parseFloat(currentMaxAmount).toLocaleString()}</span></span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="Enter new max amount (e.g. 50000)"
                    value={maxInput}
                    onChange={(e) => {
                      setMaxInput(e.target.value)
                      setMaxError('')
                    }}
                    error={maxError}
                    disabled={submittingMax}
                  />
                </div>
                <Button
                  onClick={handleUpdateMaxAmount}
                  loading={submittingMax}
                  disabled={!isAdminConnected || submittingMax}
                  className="whitespace-nowrap sm:w-auto"
                >
                  {submittingMax ? 'Updating...' : 'Update Max'}
                </Button>
              </div>

              {txHashMax && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs mt-2">
                  <span className="text-bw-muted font-mono truncate max-w-[200px]">Tx: {txHashMax}</span>
                  <a
                    href={`https://bscscan.com/tx/${txHashMax}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:underline font-medium"
                  >
                    View on BscScan <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {!isAdminConnected && (
              <p className="text-xs text-center text-amber-400">
                Action requires connecting the designated Admin Wallet ({import.meta.env.VITE_ADMIN_WALLET_ADDRESS})
              </p>
            )}
          </CardBody>
        </Card>

        {/* Card 2: Registration Fee Amount Management */}
        <Card>
          <CardHeader
            title="Registration Fee Amount"
            subtitle="Change on-chain Registration Fee required for new signups"
            actions={
              <span className="text-xs font-mono px-2 py-1 rounded bg-bw-surface border border-bw-border text-bw-muted">
                setRegisterationFee
              </span>
            }
          />
          <CardBody className="space-y-5">
            <div className="p-3.5 rounded-xl bg-bw-surface border border-bw-border text-xs text-bw-muted flex items-start gap-2.5">
              <Info size={16} className="text-bw-primary flex-shrink-0 mt-0.5" />
              <span>
                New members approve and transfer this fee during account registration. The signup workflow reads this parameter dynamically from the smart contract.
              </span>
            </div>

            {/* Registration Fee Input & Button */}
            <div className="space-y-3 p-4 rounded-xl bg-bw-surface/50 border border-bw-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-bw-text">New Registration Fee (USDT)</label>
                <span className="text-xs text-bw-muted">Current Fee: <span className="text-emerald-400 font-mono font-bold">${currentRegFee} USDT</span></span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="Enter new fee amount (e.g. 5)"
                    value={feeInput}
                    onChange={(e) => {
                      setFeeInput(e.target.value)
                      setFeeError('')
                    }}
                    error={feeError}
                    disabled={submittingFee}
                  />
                </div>
                <Button
                  onClick={handleUpdateRegFee}
                  loading={submittingFee}
                  disabled={!isAdminConnected || submittingFee}
                  className="whitespace-nowrap sm:w-auto"
                >
                  {submittingFee ? 'Updating...' : 'Update Fee'}
                </Button>
              </div>

              {txHashFee && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs mt-2">
                  <span className="text-bw-muted font-mono truncate max-w-[200px]">Tx: {txHashFee}</span>
                  <a
                    href={`https://bscscan.com/tx/${txHashFee}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:underline font-medium"
                  >
                    View on BscScan <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Contract Upgrade Notice / Diagnostic */}
            <div className="p-4 rounded-xl bg-bw-surface/40 border border-bw-border/60 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-bw-text">
                <span className="flex items-center gap-1.5">
                  <Lock size={14} className="text-bw-primary" />
                  Contract Details & Status
                </span>
                <span className="text-[11px] font-mono text-emerald-400">UUPS Proxy (ERC1967)</span>
              </div>
              <div className="flex justify-between text-bw-muted text-[11px]">
                <span>Contract Address:</span>
                <a
                  href={`https://bscscan.com/address/${MAIN_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-bw-primary hover:underline flex items-center gap-0.5"
                >
                  {MAIN_CONTRACT_ADDRESS.slice(0, 8)}...{MAIN_CONTRACT_ADDRESS.slice(-6)}
                  <ExternalLink size={10} />
                </a>
              </div>
              <div className="flex justify-between text-bw-muted text-[11px]">
                <span>Contract Owner:</span>
                <span className="font-mono text-bw-text">
                  {contractOwner ? `${contractOwner.slice(0, 8)}...${contractOwner.slice(-6)}` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between text-bw-muted text-[11px]">
                <span>Network:</span>
                <span className="text-bw-text">BNB Smart Chain Mainnet (Chain 56)</span>
              </div>
            </div>

            {!isAdminConnected && (
              <p className="text-xs text-center text-amber-400">
                Action requires connecting the designated Admin Wallet ({import.meta.env.VITE_ADMIN_WALLET_ADDRESS})
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Owner Private Key Management Section */}
      <OwnerWalletCard />
    </motion.div>
  )
}
