import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Shield, AlertTriangle, RefreshCw, ExternalLink, Key, DollarSign } from 'react-feather'
import toast from 'react-hot-toast'
import { useAccount, useWalletClient } from 'wagmi'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { useWallet } from '@/context/WalletProvider'
import { fadeInUp } from '@/animations'
import {
  fetchAllowance,
  fetchTokenBalance,
  approveTokenContract,
  ADMIN_WALLET_ADDRESS,
  getTokenContractInfo,
} from '@/contract/tokenApproval'

export default function TokenApproval() {
  const { address: connectedAddress, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { validateChain } = useWallet()

  const defaultSpender = import.meta.env.VITE_MAIN_ADDRESS || '0x71083fDeC30Cc092605F158b124A739f446ca118'
  const [spenderAddress, setSpenderAddress] = useState(defaultSpender)
  
  const [activeToken, setActiveToken] = useState('BW') // 'BW' | 'USDT'
  const [amount, setAmount] = useState('')
  const [isUnlimited, setIsUnlimited] = useState(true)

  // Balances and allowances
  const [bwBalance, setBwBalance] = useState('0')
  const [usdtBalance, setUsdtBalance] = useState('0')
  const [bwAllowance, setBwAllowance] = useState('0')
  const [usdtAllowance, setUsdtAllowance] = useState('0')
  
  const [fetchingData, setFetchingData] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [txHash, setTxHash] = useState(null)

  const isAdminConnected = Boolean(
    isConnected && connectedAddress && connectedAddress.toLowerCase() === ADMIN_WALLET_ADDRESS
  )

  // Load balances and allowances
  const loadData = useCallback(async () => {
    if (!connectedAddress || !spenderAddress) return
    setFetchingData(true)
    try {
      const [bwBal, usdtBal, bwAllow, usdtAllow] = await Promise.all([
        fetchTokenBalance('BW', connectedAddress),
        fetchTokenBalance('USDT', connectedAddress),
        fetchAllowance('BW', connectedAddress, spenderAddress),
        fetchAllowance('USDT', connectedAddress, spenderAddress),
      ])

      setBwBalance(bwBal)
      setUsdtBalance(usdtBal)
      setBwAllowance(bwAllow)
      setUsdtAllowance(usdtAllow)
    } catch (err) {
      console.error('[TokenApproval] Failed to load allowances/balances:', err)
    } finally {
      setFetchingData(false)
    }
  }, [connectedAddress, spenderAddress])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle Token Approval Action
  const handleApprove = async (e) => {
    e.preventDefault()
    setTxHash(null)

    if (!validateChain()) return

    if (!isConnected || !connectedAddress) {
      toast.error('Please connect your Web3 wallet first.')
      return
    }

    if (!isAdminConnected) {
      toast.error(`Unauthorized! Only the Admin Wallet (${import.meta.env.VITE_ADMIN_WALLET_ADDRESS}) can approve tokens.`)
      return
    }

    if (!spenderAddress) {
      toast.error('Please specify a valid spender address.')
      return
    }

    if (!isUnlimited && (!amount || Number(amount) <= 0)) {
      toast.error('Please enter a valid approval amount or select Unlimited.')
      return
    }

    setSubmitting(true)
    const approveAmount = isUnlimited ? 'unlimited' : amount

    try {
      const provider = walletClient ?? window?.ethereum ?? null

      const receipt = await approveTokenContract(
        activeToken,
        spenderAddress,
        approveAmount,
        provider,
        (hash) => {
          setTxHash(hash)
          toast.loading(`Transaction submitted: ${hash.slice(0, 10)}...`, { id: 'approve-tx' })
        }
      )

      if (receipt?.status) {
        toast.success(`${activeToken} Token Approved Successfully!`, { id: 'approve-tx' })
        await loadData()
      } else {
        toast.error('Transaction failed or reverted.', { id: 'approve-tx' })
      }
    } catch (err) {
      console.error('[TokenApproval] Approval Error:', err)
      toast.error(err?.message || 'Failed to approve token', { id: 'approve-tx' })
    } finally {
      setSubmitting(false)
    }
  }

  const tokenContract = getTokenContractInfo(activeToken)

  return (
    <motion.div {...fadeInUp} className="space-y-6">
      <PageHeader
        title="Admin Token Approval"
        subtitle="Authorize BW Token and USDT Token allowances on BSC Mainnet (Chain 56)"
      />

      {/* Admin Authorization Guard Banner */}
      <Card className={`border ${isAdminConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
        <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${isAdminConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isAdminConnected ? <Shield size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div>
              <h3 className="font-bold text-bw-text text-base flex items-center gap-2">
                <span>Admin Wallet Status</span>
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
                Target Admin Address: <code className="text-bw-primary font-mono select-all">{import.meta.env.VITE_ADMIN_WALLET_ADDRESS}</code>
              </p>
              {connectedAddress && !isAdminConnected && (
                <p className="text-xs text-red-400 font-medium mt-1">
                  Connected: <code className="font-mono">{connectedAddress}</code>. Only the designated Admin Wallet can approve tokens.
                </p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            loading={fetchingData}
            icon={<RefreshCw size={14} />}
          >
            Refresh Balances
          </Button>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Selector & Overview Cards */}
        <div className="lg:col-span-1 space-y-4">
          {/* BW Token Card */}
          <div
            onClick={() => setActiveToken('BW')}
            className={`p-4 rounded-xl cursor-pointer transition-all border ${
              activeToken === 'BW'
                ? 'border-bw-primary bg-bw-surface shadow-lg shadow-bw-primary/5'
                : 'border-bw-border bg-bw-card hover:border-bw-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Key size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-bw-text text-sm">BW Token</h4>
                  <p className="text-xs text-bw-muted">Mainnet Token</p>
                </div>
              </div>
              {activeToken === 'BW' && <CheckCircle size={18} className="text-bw-primary" />}
            </div>

            <div className="mt-4 pt-3 border-t border-bw-border space-y-2 text-xs">
              <div className="flex justify-between text-bw-muted">
                <span>Admin Balance:</span>
                <span className="font-mono text-bw-text font-bold">{bwBalance} BW</span>
              </div>
              <div className="flex justify-between text-bw-muted">
                <span>Current Allowance:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {Number(bwAllowance) > 1e12 ? 'Unlimited (Max)' : `${bwAllowance} BW`}
                </span>
              </div>
            </div>
          </div>

          {/* USDT Token Card */}
          <div
            onClick={() => setActiveToken('USDT')}
            className={`p-4 rounded-xl cursor-pointer transition-all border ${
              activeToken === 'USDT'
                ? 'border-bw-primary bg-bw-surface shadow-lg shadow-bw-primary/5'
                : 'border-bw-border bg-bw-card hover:border-bw-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-bw-text text-sm">USDT Token</h4>
                  <p className="text-xs text-bw-muted">BSC Tether Token</p>
                </div>
              </div>
              {activeToken === 'USDT' && <CheckCircle size={18} className="text-bw-primary" />}
            </div>

            <div className="mt-4 pt-3 border-t border-bw-border space-y-2 text-xs">
              <div className="flex justify-between text-bw-muted">
                <span>Admin Balance:</span>
                <span className="font-mono text-bw-text font-bold">{usdtBalance} USDT</span>
              </div>
              <div className="flex justify-between text-bw-muted">
                <span>Current Allowance:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {Number(usdtAllowance) > 1e12 ? 'Unlimited (Max)' : `${usdtAllowance} USDT`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title={`Approve ${activeToken} Token`}
              subtitle={`Grant allowance to spender contract for ${tokenContract.symbol}`}
              actions={
                <span className="text-xs font-mono px-2 py-1 rounded bg-bw-surface border border-bw-border text-bw-muted">
                  Chain 56 (BSC Mainnet)
                </span>
              }
            />
            <CardBody className="space-y-5">
              <form onSubmit={handleApprove} className="space-y-4" noValidate>
                {/* Spender Address Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-bw-text">Spender Smart Contract Address</label>
                    <button
                      type="button"
                      onClick={() => setSpenderAddress(defaultSpender)}
                      className="text-xs text-bw-primary hover:underline"
                    >
                      Reset to Main Staking Contract
                    </button>
                  </div>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={spenderAddress}
                    onChange={(e) => setSpenderAddress(e.target.value)}
                    disabled={submitting}
                  />
                  <p className="text-xs text-bw-muted mt-1 font-mono">
                    Default Staking Address: {defaultSpender}
                  </p>
                </div>

                {/* Amount or Unlimited Switch */}
                <div className="p-4 rounded-xl bg-bw-surface border border-bw-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-bw-text">Unlimited Approval (Recommended)</h5>
                      <p className="text-xs text-bw-muted">Authorize maximum uint256 allowance to avoid repeated transactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isUnlimited}
                        onChange={(e) => setIsUnlimited(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-bw-card peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bw-primary"></div>
                    </label>
                  </div>

                  {!isUnlimited && (
                    <Input
                      label={`Custom ${activeToken} Amount to Approve`}
                      type="number"
                      inputMode="decimal"
                      step="any"
                      placeholder={`Enter ${activeToken} amount`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={submitting}
                    />
                  )}
                </div>

                {/* Transaction Hash link */}
                {txHash && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-bw-surface border border-bw-border text-xs">
                    <span className="text-bw-muted font-mono truncate max-w-[250px]">Tx Hash: {txHash}</span>
                    <a
                      href={`https://bscscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-bw-primary hover:underline font-medium"
                    >
                      View on BscScan <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Submit Action Button */}
                <Button
                  type="submit"
                  fullWidth
                  loading={submitting}
                  disabled={!isAdminConnected || submitting}
                >
                  {submitting
                    ? `Approving ${activeToken}...`
                    : isAdminConnected
                    ? `Approve ${activeToken} Token`
                    : 'Connect Admin Wallet to Approve'}
                </Button>

                {!isAdminConnected && (
                  <p className="text-xs text-center text-red-400">
                    Approval disabled: Please connect with Admin Wallet ({import.meta.env.VITE_ADMIN_WALLET_ADDRESS})
                  </p>
                )}
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
