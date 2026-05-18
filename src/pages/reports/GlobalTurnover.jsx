import { useEffect, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RefreshCcw } from 'react-feather'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { fetchGlobalTurnover } from '@/store/slices/dashboardSlice'
import { selectGlobalTurnover } from '@/store/selectors'
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

// Custom recharts tooltip — memoised to prevent re-render on every mouse move
const CustomTooltip = memo(function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bw-card px-3 py-2 text-xs shadow-card">
      <p className="text-bw-muted mb-1">{label}</p>
      <p className="text-bw-primary font-semibold">
        {roundTo(payload[0]?.value, ROUND_OFF_TO)} $
      </p>
    </div>
  )
})

const COLUMNS = [
  { key: 'userName', header: 'User', render: (r) => r?.userId?.userName || r?.userName || '-' },
  { key: 'amount', header: `Amount ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.amount, ROUND_OFF_TO) },
  { key: 'type', header: 'Type', render: (r) => r.type || '-' },
  { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
]

export default memo(function GlobalTurnover() {
  const dispatch = useDispatch()
  const globalTurnover = useSelector(selectGlobalTurnover)
  const { params, setParams, setPage } = useTableParams({
    search: 'daily',
    startDate: null,
    endDate: null,
  })

  useEffect(() => {
    dispatch(fetchGlobalTurnover(params))
  }, [dispatch, params])

  const d = globalTurnover.data
  const paginate = d?.paginate || {}
  const chartData = d?.chartData || []

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Global Turnover" subtitle="Platform-wide transaction volume" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title={`Total Turnover ${CURRENCY_SYMBOL}`}
          value={d?.totalAmount ? roundTo(d.totalAmount, ROUND_OFF_TO) : '-'}
          icon={RefreshCcw}
          color="success"
          loading={globalTurnover.loading}
        />
        <StatCard
          title="Total Transactions"
          value={d?.totalCount ?? '-'}
          icon={RefreshCcw}
          color="primary"
          loading={globalTurnover.loading}
        />
      </div>

      {/* Trend chart — only rendered when data exists */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader title="Turnover Trend" />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D2FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#00D2FF"
                  fill="url(#colorTurnover)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#00D2FF' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Turnover Transactions"
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
            loading={globalTurnover.loading}
            error={globalTurnover.error}
            emptyMessage="No turnover data found."
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
