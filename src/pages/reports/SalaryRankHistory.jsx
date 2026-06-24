import { useEffect, useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Award } from 'react-feather'
import { motion } from 'framer-motion'
import { fetchSalaryRankHistory } from '@/store/slices/dashboardSlice'
import { selectSalaryRankHistory } from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import StatCard from '@/components/ui/StatCard'
import DateTimeFilter from '@/components/ui/DateTimeFilter'
import PageHeader from '@/components/ui/PageHeader'
import { useTableParams } from '@/hooks/useTableParams'
import { useDebounce } from '@/hooks/useDebounce'
import { ROUND_OFF_TO } from '@/constants'
import { formatDate, roundTo, truncateAddress } from '@/utils'
import { fadeInUp } from '@/animations'

const starLabel = (starKey) => '⭐'.repeat(Number(starKey) || 0)

const COLUMNS = [
  {
    key: 'user',
    header: 'User',
    render: (r) => (
      <div>
        <p className="font-medium text-bw-text text-sm">{r?.userId?.userName || '-'}</p>
        <p className="text-xs text-bw-muted">{r?.userId?.email || '-'}</p>
      </div>
    ),
  },
  {
    key: 'rank',
    header: 'Salary Rank',
    render: (r) => (
      <div>
        <p className="font-semibold text-bw-primary text-xs">
          {starLabel(r?.rankId?.starKey)} Rank {r?.rankId?.starKey || '—'}
        </p>
        <p className="text-xs text-bw-muted">{r?.rankId?.title || '-'}</p>
      </div>
    ),
  },
  {
    key: 'rewardPercentage',
    header: 'Salary %',
    render: (r) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bw-primary/10 text-bw-primary border border-bw-primary/20">
        {r.rewardPercentage}%
      </span>
    ),
  },
  {
    key: 'amount',
    header: 'Salary Earned (BW)',
    render: (r) => (
      <span className="font-semibold text-emerald-400">
        {Number(r.amount).toFixed(8)} BW
      </span>
    ),
  },
  {
    key: 'walletAddress',
    header: 'Wallet',
    render: (r) => truncateAddress(r?.userId?.walletAddress),
  },
  { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
]

export default memo(function SalaryRankHistory() {
  const dispatch = useDispatch()
  const salaryRankHistory = useSelector(selectSalaryRankHistory)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const { params, setParams, setPage } = useTableParams({
    startDate: null,
    endDate: null,
    userName: null,
  })

  // Synchronize debouncedSearch with params.userName
  useEffect(() => {
    setParams((prev) => ({ ...prev, userName: debouncedSearch || null, page: 1 }))
  }, [debouncedSearch, setParams])

  useEffect(() => {
    dispatch(fetchSalaryRankHistory(params))
  }, [dispatch, params])

  const d = salaryRankHistory.data
  const paginate = d?.paginate || {}

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Salary Rank History" subtitle="Overview of all salary rank rewards distributed" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Salary Distributed"
          value={d?.totalAmount ? `${Number(d.totalAmount).toFixed(4)} BW` : '-'}
          icon={Award}
          color="success"
          loading={salaryRankHistory.loading}
        />
        <StatCard
          title="Total Distribution Events"
          value={d?.totalCount ?? '-'}
          icon={Award}
          color="primary"
          loading={salaryRankHistory.loading}
        />
      </div>

      <Card>
        <CardHeader
          title="Distribution Events"
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <input
                className="bw-input text-sm w-full sm:w-48 h-[38px]"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <DateTimeFilter
                params={params}
                setParams={setParams}
                dropdownOptions={['all', 'date range']}
              />
            </div>
          }
        />
        <CardBody className="p-0">
          <Table
            columns={COLUMNS}
            data={d?.data || []}
            loading={salaryRankHistory.loading}
            error={salaryRankHistory.error}
            emptyMessage="No salary distributions found."
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
