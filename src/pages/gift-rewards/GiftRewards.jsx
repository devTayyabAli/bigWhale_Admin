import { useEffect, useState, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Star } from 'react-feather'
import { motion } from 'framer-motion'
import { fetchGiftRewards, changeGiftStatus } from '@/store/slices/giftRewardsSlice'
import { selectGiftRewards } from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import ConfirmModal from '@/components/ui/ConfirmModal'
import DateTimeFilter from '@/components/ui/DateTimeFilter'
import PageHeader from '@/components/ui/PageHeader'
import { GIFT_STATUS_OPTIONS, STAR_REWARD_OPTIONS } from '@/constants'
import { capitalizeWords, formatDate } from '@/utils'
import { fadeInUp } from '@/animations'

const buildApiParams = (p) => ({
  ...p,
  status: p.status === 'all' ? null : p.status,
  starReward: p.starReward === 'all' ? null : p.starReward.split(' ').join('-'),
})

const StarRating = memo(function StarRating({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  )
})

const ActionButtons = memo(function ActionButtons({ row, onAction }) {
  const isPending = row?.status === 'pending'
  return (
    <div className="flex items-center justify-center gap-1">
      <Button size="xs" variant="success" disabled={!isPending}
        onClick={() => isPending && onAction(row, 'approve')}>
        Approve
      </Button>
      <Button size="xs" variant="danger" disabled={!isPending}
        onClick={() => isPending && onAction(row, 'reject')}>
        Reject
      </Button>
    </div>
  )
})

const INITIAL_PARAMS = {
  page: 1, limit: 10, status: 'all', search: null,
  startDate: null, endDate: null, starReward: 'all',
}

export default function GiftRewards() {
  const dispatch = useDispatch()
  const { loading, data, error, updating } = useSelector(selectGiftRewards)
  const [confirmModal, setConfirmModal] = useState(null)
  const [params, setParams] = useState(INITIAL_PARAMS)

  useEffect(() => {
    dispatch(fetchGiftRewards(buildApiParams(params)))
  }, [dispatch, params])

  const handleAction = useCallback((row, action) => setConfirmModal({ row, action }), [])

  const handleConfirm = useCallback(() => {
    if (!confirmModal) return
    dispatch(changeGiftStatus({
      id: confirmModal.row._id,
      body: { status: confirmModal.action === 'approve' ? 'accepted' : 'rejected' },
      params: buildApiParams(params),
    }))
    setConfirmModal(null)
  }, [confirmModal, dispatch, params])

  const columns = [
    {
      key: 'user', header: 'User',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-bw-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r?.userId?.userName?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm truncate max-w-[80px]">{r?.userId?.userName || '-'}</span>
        </div>
      ),
    },
    {
      key: 'starReward', header: 'Stars',
      render: (r) => <StarRating count={Number(r?.rankId?.title?.[0]) || 0} />,
    },
    { key: 'gift', header: 'Gift', render: (r) => r?.giftId?.title || '-' },
    { key: 'amount', header: 'Amt ($)', render: (r) => r?.giftId?.amount ?? '-' },
    { key: 'date', header: 'Date', render: (r) => formatDate(r?.createdAt) },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r?.status} /> },
    {
      key: 'actions', header: 'Actions', align: 'center',
      render: (r) => <ActionButtons row={r} onAction={handleAction} />,
    },
  ]

  const totalRecords = data?.data?.totalRecords || data?.totalRecords || 0

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Star Win Requests" subtitle="Manage gift reward requests" />

      <Card>
        <CardHeader
          title="Gift Rewards"
          actions={
            /* Responsive filter row — wraps on mobile */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Select
                options={STAR_REWARD_OPTIONS.map((o) => ({ value: o, label: capitalizeWords(o) }))}
                value={params.starReward}
                onChange={(e) => setParams((p) => ({ ...p, starReward: e.target.value, page: 1 }))}
                className="w-full sm:w-36"
              />
              <Select
                options={GIFT_STATUS_OPTIONS.map((o) => ({ value: o, label: capitalizeWords(o) }))}
                value={params.status}
                onChange={(e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 }))}
                className="w-full sm:w-32"
              />
              <DateTimeFilter params={params} setParams={setParams} />
            </div>
          }
        />
        <CardBody className="p-0">
          <Table columns={columns} data={data?.data?.giftRequest || data?.giftRequest || []} loading={loading} error={error}
            emptyMessage="No gift reward requests found." />
          <Pagination
            currentPage={Number(data?.data?.page || data?.page) || params.page}
            totalPages={Math.ceil(totalRecords / params.limit) || 1}
            totalItems={totalRecords}
            limit={params.limit}
            onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
          />
        </CardBody>
      </Card>

      <ConfirmModal
        isOpen={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirm}
        loading={updating}
        title={confirmModal?.action === 'approve' ? 'Approve Request' : 'Reject Request'}
        message={`Are you sure you want to ${confirmModal?.action} this gift reward request?`}
        confirmLabel={capitalizeWords(confirmModal?.action || '')}
        confirmVariant={confirmModal?.action === 'approve' ? 'success' : 'danger'}
      />
    </motion.div>
  )
}
