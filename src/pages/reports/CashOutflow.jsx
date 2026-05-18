import { useEffect, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TrendingDown } from 'react-feather'
import { motion } from 'framer-motion'
import { fetchCashOutflow } from '@/store/slices/dashboardSlice'
import { selectCashOutflow } from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import StatCard from '@/components/ui/StatCard'
import DateTimeFilter from '@/components/ui/DateTimeFilter'
import PageHeader from '@/components/ui/PageHeader'
import { useTableParams } from '@/hooks/useTableParams'
import { CURRENCY_SYMBOL, ROUND_OFF_TO } from '@/constants'
import { formatDate, roundTo, truncateAddress } from '@/utils'
import { fadeInUp } from '@/animations'

// Server response shape: { data[], totalAmount, totalCount, paginate }
const COLUMNS = [
  {
    key: 'user',
    header: 'User',
    render: (r) => r?.userId?.userName || r?.userId?.name || '-',
  },
  {
    key: 'amount',
    header: `Amount ${CURRENCY_SYMBOL}`,
    render: (r) => roundTo(r.amount, ROUND_OFF_TO),
  },
  {
    key: 'walletAddress',
    header: 'Wallet',
    render: (r) => truncateAddress(r?.userId?.walletAddress),
  },
  { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
]

export default memo(function CashOutflow() {
  const dispatch = useDispatch()
  const cashOutflow = useSelector(selectCashOutflow)
  const { params, setParams, setPage } = useTableParams({
    startDate: null,
    endDate: null,
  })

  useEffect(() => {
    dispatch(fetchCashOutflow(params))
  }, [dispatch, params])

  const d = cashOutflow.data
  const paginate = d?.paginate || {}

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Cash Outflow" subtitle="Withdrawal transactions overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title={`Total Outflow ${CURRENCY_SYMBOL}`}
          value={d?.totalAmount ? roundTo(d.totalAmount, ROUND_OFF_TO) : '-'}
          icon={TrendingDown}
          color="danger"
          loading={cashOutflow.loading}
        />
        <StatCard
          title="Total Transactions"
          value={d?.totalCount ?? '-'}
          icon={TrendingDown}
          color="primary"
          loading={cashOutflow.loading}
        />
      </div>

      <Card>
        <CardHeader
          title="Withdrawal Transactions"
          actions={
            <DateTimeFilter
              params={params}
              setParams={setParams}
              dropdownOptions={['all', 'date range']}
            />
          }
        />
        <CardBody className="p-0">
          <Table
            columns={COLUMNS}
            data={d?.data || []}
            loading={cashOutflow.loading}
            error={cashOutflow.error}
            emptyMessage="No outflow transactions found."
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
