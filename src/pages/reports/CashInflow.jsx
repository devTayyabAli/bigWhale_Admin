import { useEffect, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TrendingUp } from 'react-feather'
import { motion } from 'framer-motion'
import { fetchCashInflow } from '@/store/slices/dashboardSlice'
import { selectCashInflow } from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import StatCard from '@/components/ui/StatCard'
import DateTimeFilter from '@/components/ui/DateTimeFilter'
import PageHeader from '@/components/ui/PageHeader'
import { useTableParams } from '@/hooks/useTableParams'
import { CURRENCY_SYMBOL, ROUND_OFF_TO } from '@/constants'
import { formatDate, roundTo } from '@/utils'
import { fadeInUp } from '@/animations'

const COLUMNS = [
  { key: 'userName', header: 'User', render: (r) => r?.userId?.userName || r?.userName || '-' },
  { key: 'amount', header: `Amount ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.amount, ROUND_OFF_TO) },
  { key: 'type', header: 'Type', render: (r) => r.type || '-' },
  { key: 'txHash', header: 'Tx Hash', render: (r) => r.txHash ? `${r.txHash.slice(0, 8)}…` : '-' },
  { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
]

export default memo(function CashInflow() {
  const dispatch = useDispatch()
  const cashInflow = useSelector(selectCashInflow)
  const { params, setParams, setPage } = useTableParams({
    search: 'daily',
    startDate: null,
    endDate: null,
  })

  useEffect(() => {
    dispatch(fetchCashInflow(params))
  }, [dispatch, params])

  const d = cashInflow.data
  const paginate = d?.paginate || {}

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Cash Inflow" subtitle="Incoming funds overview" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={`Total Inflow ${CURRENCY_SYMBOL}`}
          value={d?.totalAmount ? roundTo(d.totalAmount, ROUND_OFF_TO) : '-'}
          icon={TrendingUp}
          color="success"
          loading={cashInflow.loading}
        />
        <StatCard
          title="Total Transactions"
          value={d?.totalCount ?? '-'}
          icon={TrendingUp}
          color="primary"
          loading={cashInflow.loading}
        />
        <StatCard
          title={`Average ${CURRENCY_SYMBOL}`}
          value={d?.avgAmount ? roundTo(d.avgAmount, ROUND_OFF_TO) : '-'}
          icon={TrendingUp}
          color="info"
          loading={cashInflow.loading}
        />
      </div>

      <Card>
        <CardHeader
          title="Inflow Transactions"
          actions={
            <DateTimeFilter
              params={params}
              setParams={setParams}
              dropdownOptions={['all', 'daily', 'weekly', 'monthly', 'date range']}
            />
          }
        />
        <CardBody className="p-0">
          <Table
            columns={COLUMNS}
            data={d?.data || []}
            loading={cashInflow.loading}
            error={cashInflow.error}
            emptyMessage="No inflow transactions found."
          />
          <Pagination
            currentPage={paginate.currentPage || params.page}
            totalPages={paginate.totalPages || 1}
            totalItems={paginate.totalItems || 0}
            limit={params.limit}
            onPageChange={setPage}
          />
        </CardBody>
      </Card>
    </motion.div>
  )
})
