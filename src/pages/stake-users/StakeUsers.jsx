import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, Info } from 'react-feather'
import toast from 'react-hot-toast'
import { useWalletClient } from 'wagmi'
import { fetchAllUsers } from '@/store/slices/usersSlice'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { useWallet } from '@/context/WalletProvider'
import { stakeKGC, completeStake, activateStake } from '@/services/staking'
import { STAKE_MIN, STAKE_MAX } from '@/constants'
import { useDebounce } from '@/hooks/useDebounce'
import { fadeInUp } from '@/animations'

export default function StakeUsers() {
  const dispatch = useDispatch()
  const { allUsers } = useSelector((s) => s.users)
  const { validateChain, ensureAdminWallet } = useWallet()

  // Get the EIP-1193 provider directly from the wagmi wallet client.
  // This uses the wallet connected via Reown AppKit (MetaMask, WC, etc.)
  // and avoids window.ethereum which can be hijacked by Phantom / other extensions.
  const { data: walletClient } = useWalletClient()

  const [amount, setAmount]             = useState('')
  const [bwPrice, setBwPrice]           = useState(0)
  const [priceLoading, setPriceLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userSearch, setUserSearch]     = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [walletError, setWalletError]   = useState(false)
  const [amountError, setAmountError]   = useState('')
  const [stakeTokensFn, setStakeTokensFn] = useState(null)

  const debouncedSearch = useDebounce(userSearch, 300)

  // Lazy-load stakeTokens contract helper
  useEffect(() => {
    import('@/contract/staking')
      .then((mod) => setStakeTokensFn(() => mod.stakeTokens))
      .catch(() => {})
  }, [])

  // Fetch BW price from contract once on mount
  useEffect(() => {
    setPriceLoading(true)
    import('@/contract/staking')
      .then((mod) => mod.fetchBWPrice())
      .then((price) => setBwPrice(price))
      .catch((err) => { console.error('[StakeUsers] fetchBWPrice failed:', err); setBwPrice(0) })
      .finally(() => setPriceLoading(false))
  }, [])

  // BW tokens = usdAmount / pricePerToken  (pure local math, instant)
  const bwTokens = (() => {
    const usd   = parseFloat(amount)
    const price = parseFloat(bwPrice)
    if (!usd || !price || price === 0) return 0
    return usd / price
  })()

  useEffect(() => {
    dispatch(fetchAllUsers({ page: 1, limit: 40, search: debouncedSearch || null, status: 'active' }))
  }, [dispatch, debouncedSearch])

  const handleAmountChange = useCallback((e) => {
    const val = e.target.value
    if (val !== '' && parseFloat(val) > STAKE_MAX) {
      setAmountError(`Maximum is $${STAKE_MAX.toLocaleString()}`)
    } else {
      setAmountError('')
    }
    setAmount(val)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (parseFloat(amount) < STAKE_MIN) { setAmountError(`Minimum stake is $${STAKE_MIN}`); return }
    if (!selectedUser) { toast.error('Please select a user'); return }
    if (!walletClient) { toast.error('Please connect your wallet first'); return }

    try {
      if (!validateChain()) return

      const wallet = await ensureAdminWallet()
      if (!wallet) { setWalletError(true); return }
      setWalletError(false)
      setLoading(true)

      // Create pending stake record — stake.amount = USDT fiat value
      // (used by the reward cron to calculate daily rewards)
      const stakeRes = await stakeKGC({ userId: selectedUser._id, amount: Number(amount) })
      const stakeId  = stakeRes?.data?.data?._id

      if (stakeTokensFn) {
        // Track txHash so onComplete can also call activateStake
        let savedTxHash = null

        // Pass walletClient as the EIP-1193 provider — avoids window.ethereum
        // and ensures Phantom/other non-EVM extensions don't intercept the call
        await stakeTokensFn(
          selectedUser.walletAddress,
          bwTokens,
          stakeId,
          async (txHash) => {
            // 1. Save txHash: store transaction details, sets stake.transactionId
            savedTxHash = txHash
            await completeStake({
              id: stakeId,
              data: {
                userId:       selectedUser._id,
                txHash,
                fiatAmount:   Number(amount),
                cryptoAmount: Number(bwTokens),
              },
            })
          },
          async () => {
            // 2. On receipt: activate — sets Transaction→completed, Stake→active
            //    triggers instant bonus for referrer via handleStakeEvent
            if (savedTxHash) {
              try {
                await activateStake(savedTxHash)
              } catch (activateErr) {
                console.warn('[StakeUsers] activateStake failed:', activateErr?.message)
              }
            }
            setLoading(false)
            toast.success('Stake completed successfully')
            setAmount('')
            setSelectedUser(null)
            setUserSearch('')
          },
          walletClient, // ← explicit provider, bypasses window.ethereum
        )
      } else {
        setLoading(false)
        toast.success('Stake record created')
        setAmount('')
        setSelectedUser(null)
      }
    } catch (err) {
      setLoading(false)
      toast.error(err?.message || 'Staking failed')
    }
  }

  const users = allUsers.data?.data || []

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Stake Users" subtitle="Manually stake tokens for a user" />

      <div className="w-full sm:max-w-lg">
        <Card>
          <CardHeader title="New Stake" actions={<TrendingUp size={16} className="text-bw-primary" />} />
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Amount */}
              <Input
                label="Stake Amount ($)"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder={`Min $${STAKE_MIN} — Max $${STAKE_MAX.toLocaleString()}`}
                value={amount}
                onChange={handleAmountChange}
                error={amountError}
                disabled={loading}
              />

              {/* BW tokens preview — computed from contract price */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bw-surface border border-bw-border">
                <div className="flex flex-col">
                  <span className="text-sm text-bw-muted">BW Tokens</span>
                  {!priceLoading && bwPrice > 0 && (
                    <span className="text-xs text-bw-muted mt-0.5">
                      1 BW = ${bwPrice} USDT
                    </span>
                  )}
                </div>
                <span className="text-bw-primary font-bold text-sm">
                  {priceLoading ? (
                    <span className="text-bw-muted text-xs animate-pulse">Loading price…</span>
                  ) : bwPrice === 0 ? (
                    <span className="text-red-400 text-xs">Price unavailable</span>
                  ) : (
                    `${bwTokens > 0 ? Number(bwTokens).toFixed(4) : '0.0000'} BW`
                  )}
                </span>
              </div>

              {/* User autocomplete */}
              <div className="relative">
                <Input
                  label="Search User"
                  placeholder="Type username or name…"
                  value={selectedUser ? `${selectedUser.name} (${selectedUser.userName})` : userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(null); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  disabled={loading}
                  autoComplete="off"
                />
                {showDropdown && users.length > 0 && !selectedUser && (
                  <div className="absolute z-10 w-full mt-1 bw-card max-h-48 overflow-y-auto shadow-card-hover">
                    {users.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => { setSelectedUser(u); setUserSearch(''); setShowDropdown(false) }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-bw-surface transition-colors"
                      >
                        <span className="font-medium text-bw-text">{u.name}</span>
                        <span className="text-bw-muted ml-2">@{u.userName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Limits info */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-bw-primary/5 border border-bw-primary/20 text-xs text-bw-muted">
                <Info size={13} className="text-bw-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <p>Minimum: <span className="text-bw-text font-medium">${STAKE_MIN}</span></p>
                  <p>Maximum: <span className="text-bw-text font-medium">${STAKE_MAX.toLocaleString()}</span></p>
                </div>
              </div>

              {walletError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Please connect with the admin wallet.</span>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={!amount || parseFloat(amount) < STAKE_MIN || Boolean(amountError) || !selectedUser}
              >
                {loading ? 'Processing…' : 'Stake Now'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  )
}
