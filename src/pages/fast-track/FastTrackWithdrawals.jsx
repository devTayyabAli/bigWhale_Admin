import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import PageHeader from '@/components/ui/PageHeader'
import { getFastTrackWithdrawals, cancelFastTrackWithdrawal } from '@/services/fastTrack'
import { formatDate, roundTo } from '@/utils'
import { ROUND_OFF_TO } from '@/constants'
import { fadeInUp } from '@/animations'

const FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Confirmed' },
  { value: 'inactive', label: 'Cancelled' },
  { value: 'all', label: 'All' },
]

export default function FastTrackWithdrawals() {
  const [status, setStatus] = useState('pending')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getFastTrackWithdrawals(status)
      setRows(data?.data || [])
    } catch {
      toast.error('Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  const cancel = async (id) => {
    if (reason.trim().length < 3) {
      toast.error('Enter a reason (at least 3 characters) first')
      return
    }
    setCancelling(id)
    try {
      await cancelFastTrackWithdrawal(id, { reason: reason.trim() })
      toast.success('Withdrawal cancelled')
      setReason('')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancel failed')
    } finally {
      setCancelling(null)
    }
  }

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (r) => r?.userId?.userName || r?.userId?.name || '-',
    },
    { key: 'amount', header: 'Net BW', render: (r) => roundTo(r.amount, ROUND_OFF_TO) },
    { key: 'chunk', header: 'Chunk', render: () => '10 BW' },
    { key: 'joinings', header: 'Joinings', render: (r) => r.requiredJoinings ?? 1 },
    {
      key: 'quota',
      header: 'Quota',
      render: (r) => (r.fastTrackQuotaConsumedAt ? 'Consumed' : 'Not used'),
    },
    {
      key: 'state',
      header: 'State',
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <Badge status={r.status} />
          {r.stale && <span className="text-xs text-amber-400">Stale</span>}
        </span>
      ),
    },
    { key: 'date', header: 'Requested', render: (r) => formatDate(r.createdAt) },
    {
      key: 'action',
      header: 'Action',
      render: (r) =>
        r.status === 'pending' && !r.fastTrackQuotaConsumedAt ? (
          <Button
            size="xs"
            variant="danger"
            loading={cancelling === r._id}
            disabled={Boolean(cancelling)}
            onClick={() => cancel(r._id)}
          >
            Cancel
          </Button>
        ) : null,
    },
  ]

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader
        title="Fast-Track Withdrawals"
        subtitle="10 BW chunks. A joining credit is used only after the withdrawal is confirmed."
        backPath="/fast-track"
      />

      <Card>
        <CardHeader
          title="10 BW Withdrawals"
          actions={
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <Button
                  key={f.value}
                  size="xs"
                  variant={status === f.value ? 'primary' : 'secondary'}
                  onClick={() => setStatus(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          }
        />
        <CardBody className="space-y-3">
          <label className="block text-xs text-bw-muted max-w-lg">
            Reason (required to cancel a pending withdrawal)
            <input
              className="bw-input w-full text-sm h-[38px] mt-1"
              placeholder="Why is this withdrawal being cancelled?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <p className="text-xs text-bw-muted">
            Stale means the user never signed the on-chain transaction and it has been pending longer
            than 10 minutes. Cancelling does not touch their joining credits, because those are only
            taken when a withdrawal is confirmed.
          </p>
        </CardBody>
        <Table
          columns={columns}
          data={rows}
          loading={loading}
          emptyMessage="No withdrawals in this view."
        />
      </Card>
    </motion.div>
  )
}
