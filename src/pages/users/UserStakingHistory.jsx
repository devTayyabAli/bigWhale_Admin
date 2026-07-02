import { useEffect, useState, memo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserStakingList, fetchStakeHistory, updateStakeStatus } from '@/store/slices/usersSlice'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ConfirmModal from '@/components/ui/ConfirmModal'
import PageHeader from '@/components/ui/PageHeader'
import { CURRENCY_SYMBOL, ROUND_OFF_TO } from '@/constants'
import { formatDate, roundTo } from '@/utils'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/animations'

export default memo(function UserStakingHistory() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { staking, stakeHistory } = useSelector((s) => s.users)
  const [page, setPage] = useState(1)
  const [selectedStake, setSelectedStake] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  useEffect(() => {
    dispatch(fetchUserStakingList({ userId: id, params: { page, limit: 10 } }))
  }, [dispatch, id, page])

  useEffect(() => {
    if (selectedStake) {
      dispatch(fetchStakeHistory({ stakeId: selectedStake._id, params: { page: 1, limit: 20 } }))
    }
  }, [dispatch, selectedStake])

  const stakeColumns = [
    { key: 'fiat',      header: `USDT ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.amount ?? 0, ROUND_OFF_TO) },
    { key: 'tokens',    header: 'BW Tokens',               render: (r) => roundTo(r?.transactionId?.cryptoAmount ?? 0, ROUND_OFF_TO) },
    { key: 'status',    header: 'Status',                  render: (r) => <Badge status={r.status} /> },
    { key: 'createdAt', header: 'Date',                    render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions', header: 'Actions', align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center gap-1">
          <Button size="xs" variant="outline" onClick={() => setSelectedStake(r)}>
            History
          </Button>
          {r.status === 'active' && (
            <Button size="xs" variant="danger" onClick={() => setConfirmModal(r)}>
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ]

  const historyColumns = [
    { key: 'reward',    header: `Reward ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.reward || r.amount, ROUND_OFF_TO) },
    { key: 'day',       header: 'Day',                       render: (r) => r.day ?? '-' },
    { key: 'createdAt', header: 'Date',                      render: (r) => formatDate(r.createdAt) },
  ]

  const paginate = staking.data?.paginate || {}

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Staking History" backPath={`/users/user-details/${id}`} />

      <Card>
        <CardHeader title="User Stakes" subtitle={`Total: ${paginate.totalItems ?? 0}`} />
        <CardBody className="p-0">
          <Table
            columns={stakeColumns}
            data={staking.data?.data || []}
            loading={staking.loading}
            error={staking.error}
          />
          <Pagination
            currentPage={paginate.currentPage || page}
            totalPages={paginate.totalPages || 1}
            totalItems={paginate.totalItems || 0}
            limit={10}
            onPageChange={setPage}
          />
        </CardBody>
      </Card>

      {selectedStake && (
        <Card>
          <CardHeader
            title={`Reward History — Stake #${selectedStake._id?.slice(-6)}`}
            actions={
              <Button size="xs" variant="ghost" onClick={() => setSelectedStake(null)}>
                Close
              </Button>
            }
          />
          <CardBody className="p-0">
            <Table
              columns={historyColumns}
              data={stakeHistory.data?.data || []}
              loading={stakeHistory.loading}
              error={stakeHistory.error}
              emptyMessage="No reward history for this stake."
            />
          </CardBody>
        </Card>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={() => {
          dispatch(updateStakeStatus({ id: confirmModal._id, body: { status: 'inactive' }, userId: id }))
          setConfirmModal(null)
        }}
        title="Deactivate Stake"
        message={`Are you sure you want to deactivate this stake of ${roundTo(confirmModal?.amount, ROUND_OFF_TO)} ${CURRENCY_SYMBOL}?`}
        confirmLabel="Deactivate"
        confirmVariant="danger"
      />
    </motion.div>
  )
})
