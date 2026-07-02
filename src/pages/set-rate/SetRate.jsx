import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { Sliders, AlertCircle } from 'react-feather'
import toast from 'react-hot-toast'
import { useWalletClient } from 'wagmi'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { useWallet } from '@/context/WalletProvider'
import { fetchRate, setRate } from '@/services/setRate'
import { fadeInUp } from '@/animations'

const schema = yup.object({
  amount: yup
    .number()
    .typeError('Please enter a valid number')
    .positive('Amount must be positive')
    .required('Amount is required'),
})

export default function SetRate() {
  const { validateChain, ensureAdminWallet } = useWallet()
  // wagmi v2: walletClient exposes the EIP-1193 transport for web3.js
  const { data: walletClient } = useWalletClient()

  const [currentRate, setCurrentRate] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [walletError, setWalletError] = useState(false)
  const [contractFn, setContractFn]   = useState(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  })

  // Lazy-load contract helper on mount
  useEffect(() => {
    import('@/contract/staking')
      .then((mod) => setContractFn(() => mod.setTokenPrice))
      .catch(() => {})
  }, [])

  // Fetch current rate on mount
  useEffect(() => {
    fetchRate()
      .then(({ data }) => {
        // Server returns { success, data: { amount, ... } }
        const amount = data?.data?.amount
        if (amount) {
          setCurrentRate(amount)
          setValue('amount', amount)
        }
      })
      .catch(() => {})
  }, [setValue])

  const onSubmit = async ({ amount }) => {
    setLoading(true)
    try {
      if (!validateChain()) return

      const wallet = await ensureAdminWallet()
      if (!wallet) { setWalletError(true); return }
      setWalletError(false)

      // Pass the EIP-1193 provider from the wagmi walletClient to web3.js
      // walletClient is null when no wallet is connected
      const provider = walletClient ?? window?.ethereum ?? null

      if (contractFn && provider) {
        const tx = await contractFn(amount, provider)
        if (tx?.status && tx?.transactionHash) {
          await setRate({ amount: Number(amount), txHash: tx.transactionHash })
          setCurrentRate(amount)
          toast.success('Token rate updated successfully')
        }
      } else {
        // Fallback: persist to DB only (no on-chain tx)
        await setRate({ amount: Number(amount) })
        setCurrentRate(amount)
        toast.success('Rate updated successfully')
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to set rate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Set Rate" subtitle="Update the BW token price" />

      <div className="w-full sm:max-w-md">
        <Card>
          <CardHeader
            title="Token Rate"
            actions={<Sliders size={16} className="text-bw-primary" />}
          />
          <CardBody className="space-y-5">

            {currentRate !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-bw-surface border border-bw-border">
                <span className="text-sm text-bw-muted">Current Rate</span>
                <span className="text-bw-primary font-bold text-sm">{currentRate} BW / $1</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="New Rate (BW Tokens per $1)"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="Enter BW token amount"
                error={errors.amount?.message}
                disabled={loading}
                {...register('amount')}
              />

              {walletError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Please connect with the admin wallet to proceed.</span>
                </div>
              )}

              <Button type="submit" fullWidth loading={loading}>
                {loading ? 'Processing Transaction…' : 'Update Rate'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  )
}
