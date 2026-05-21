import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, Info } from 'react-feather'
import toast from 'react-hot-toast'
import { fetchAllUsers } from '@/store/slices/usersSlice'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { useWeb3 } from '@/hooks/useWeb3'
import { stakeKGC, stakeKGCOnTransaction, completeStake } from '@/services/staking'
import { STAKE_MIN, STAKE_MAX } from '@/constants'
import { useDebounce } from '@/hooks/useDebounce'
import { fadeInUp } from '@/animations'

export default function StakeUsers() {
  const dispatch = useDispatch()
  const { allUsers } = useSelector((s) => s.users)
  const { validateChain, ensureAdminWallet } = useWeb3()

  const [amount, setAmount] = useState('')
  const [kgcTokens, setKgcTokens] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userSearch, setUserSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [walletError, setWalletError] = useState(false)
  const [amountError, setAmountError] = useState('')
  const [contractFns, setContractFns] = useState({ fetchKGCTokens: null, stakeTokens: null })

  const debouncedSearch = useDebounce(userSearch, 300)

  // Lazy-load contract helpers
  useEffect(() => {
    import('@/contract/staking')
      .then((mod) => setContractFns({ fetchKGCTokens: mod.fetchKGCTokens, stakeTokens: mod.stakeTokens }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    dispatch(fetchAllUsers({ page: 1, limit: 40, search: debouncedSearch || null, status: 'active' }))
  }, [dispatch, debouncedSearch])

  useEffect(() => {
    if (!amount || !contractFns.fetchKGCTokens) { setKgcTokens(0); return }
    contractFns.fetchKGCTokens(amount).then(setKgcTokens).catch(() => setKgcTokens(0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, contractFns.fetchKGCTokens])

  const handleAmountChange = (e) => {
    const val = e.target.value
    if (val !== '' && parseFloat(val) > STAKE_MAX) {
      setAmountError(`Maximum is $${STAKE_MAX.toLocaleString()}`)
    } else {
      setAmountError('')
    }
    setAmount(val)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (parseFloat(amount) < STAKE_MIN) { setAmountError(`Minimum stake is $${STAKE_MIN}`); return }
    if (!selectedUser) { toast.error('Please select a user'); return }

    try {
      const chainOk = await validateChain()
      if (!chainOk) return

      const wallet = await ensureAdminWallet()
      if (!wallet) { setWalletError(true); return }
      setWalletError(false)
      setLoading(true)

      const stakeData = await stakeKGC({ userId: selectedUser._id, amount: Number(kgcTokens) })

      if (contractFns.stakeTokens) {
        await contractFns.stakeTokens(
          selectedUser.walletAddress, kgcTokens, stakeData,
          async (txHash) => {
            await stakeKGCOnTransaction({
              id: stakeData?.data?._id,
              data: { userId: selectedUser._id, txHash, fiatAmount: Number(amount), cryptoAmount: Number(kgcTokens) },
            })
          },
          async (receipt) => {
            await completeStake(receipt?.transactionHash)
            setLoading(false)
            toast.success('Stake completed successfully')
            setAmount(''); setSelectedUser(null); setUserSearch('')
          }
        )
      } else {
        setLoading(false)
        toast.success('Stake record created')
        setAmount(''); setSelectedUser(null)
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

      {/* Full width on mobile, constrained on sm+ */}
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

              {/* KGC preview */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bw-surface border border-bw-border">
                <span className="text-sm text-bw-muted">BW Tokens</span>
                <span className="text-bw-primary font-bold text-sm">{kgcTokens ?? 0} BW</span>
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
                disabled={!Number(kgcTokens) || !selectedUser || Boolean(amountError)}
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
