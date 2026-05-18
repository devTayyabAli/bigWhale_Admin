import { useEffect, useState, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Users, RefreshCcw, TrendingUp, Gift } from 'react-feather'
import {
  fetchDashboardStats,
  fetchStakeRewards,
  fetchSaleKGC,
} from '@/store/slices/dashboardSlice'
import {
  selectDashboardStats,
  selectStakeRewards,
  selectSaleKGC,
} from '@/store/selectors'
import StatCard from '@/components/ui/StatCard'
import DateTimeFilter from '@/components/ui/DateTimeFilter'
import PageHeader from '@/components/ui/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import { CURRENCY_SYMBOL, ROUND_OFF_TO } from '@/constants'
import { formatDate, roundTo } from '@/utils'
import { staggerContainer, staggerItem } from '@/animations'

const STAKE_COLUMNS = [
  { key: 'userName', header: 'User', render: (r) => r?.userId?.userName || r?.userName || '-' },
  { key: 'amount', header: `Amt ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r?.amount, ROUND_OFF_TO) },
  { key: 'status', header: 'Status', render: (r) => <Badge status={r?.status} /> },
  { key: 'createdAt', header: 'Date', render: (r) => formatDate(r?.createdAt) },
]

const SALE_COLUMNS = [
  { key: 'userName', header: 'User', render: (r) => r?.userId?.userName || r?.userName || '-' },
  { key: 'tokens', header: 'BRC', render: (r) => roundTo(r?.tokens, ROUND_OFF_TO) },
  { key: 'amount', header: `Amt ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r?.amount, ROUND_OFF_TO) },
  { key: 'status', header: 'Status', render: (r) => <Badge status={r?.status} /> },
  { key: 'createdAt', header: 'Date', render: (r) => formatDate(r?.createdAt) },
]

const SearchInput = memo(function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      className="bw-input text-sm w-full sm:w-44"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  )
})

const INITIAL_PARAMS = {
  page: 1, limit: 10, search: 'daily', startDate: null, endDate: null,
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const stats = useSelector(selectDashboardStats)
  const stakeRewards = useSelector(selectStakeRewards)
  const saleKGC = useSelector(selectSaleKGC)

  const [params, setParams] = useState(INITIAL_PARAMS)
  const [stakeSearch, setStakeSearch] = useState('')
  const [saleSearch, setSaleSearch] = useState('')
  const [stakePage, setStakePage] = useState(1)
  const [salePage, setSalePage] = useState(1)

  useEffect(() => {
    dispatch(fetchDashboardStats({
      search: params.search,
      startDate: params.startDate,
      endDate: params.endDate,
    }))
  }, [dispatch, params.search, params.startDate, params.endDate])

  useEffect(() => {
    dispatch(fetchStakeRewards({
      ...params,
      search: params.search === 'date range' ? null : params.search,
      userName: stakeSearch || undefined,
      page: stakePage,
    }))
  }, [dispatch, params, stakeSearch, stakePage])

  useEffect(() => {
    dispatch(fetchSaleKGC({
      ...params,
      search: params.search === 'date range' ? null : params.search,
      userName: saleSearch || undefined,
      page: salePage,
    }))
  }, [dispatch, params, saleSearch, salePage])

  const handleStakeSearch = useCallback((e) => { setStakeSearch(e.target.value); setStakePage(1) }, [])
  const handleSaleSearch  = useCallback((e) => { setSaleSearch(e.target.value);  setSalePage(1)  }, [])

  const d = stats.data
  const loading = stats.loading
  const stakePaginate = stakeRewards.data?.paginate || {}
  const salePaginate  = saleKGC.data?.paginate || {}

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header + filter — stack on mobile */}
      <div className="flex flex-col gap-3">
        <PageHeader title="Dashboard" subtitle="BigWhale platform overview" />
        <DateTimeFilter
          params={params}
          setParams={setParams}
          dropdownOptions={['all', 'daily', 'weekly', 'monthly', 'date range']}
        />
      </div>

      {/* Stat cards — 1 col mobile, 2 col sm, 4 col xl */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
      >
        {[
          { title: 'Total Users', value: d?.totalusers ?? '-', icon: Users, color: 'primary' },
          {
            title: `Global Turnover ${params.search === 'daily' ? 'Today' : (params.search ?? '')} ${CURRENCY_SYMBOL}`,
            value: d?.totalGlobal ? roundTo(d.totalGlobal, ROUND_OFF_TO) : '-',
            icon: RefreshCcw, color: 'success',
          },
          {
            title: `Staking Rewards ${CURRENCY_SYMBOL}`,
            value: d?.totalUserStake?.totalAmount ? roundTo(d.totalUserStake.totalAmount, ROUND_OFF_TO) : '-',
            icon: TrendingUp, color: 'info',
          },
          {
            title: `Rewards Distributed ${CURRENCY_SYMBOL}`,
            value: d?.totalRewardDistribute?.totalAmount ? roundTo(d.totalRewardDistribute.totalAmount, ROUND_OFF_TO) : '-',
            icon: Gift, color: 'warning',
          },
        ].map((card) => (
          <motion.div key={card.title} variants={staggerItem}>
            <StatCard {...card} loading={loading} />
          </motion.div>
        ))}
      </motion.div>

      {/* Stake Rewards */}
      <Card>
        <CardHeader
          title="Stake Rewards"
          subtitle={`${params.search === 'daily' ? "Today's" : ''} staking activity`}
          actions={
            <SearchInput value={stakeSearch} onChange={handleStakeSearch} placeholder="Search username…" />
          }
        />
        <CardBody className="p-0">
          <Table columns={STAKE_COLUMNS} data={stakeRewards.data?.data || []} loading={stakeRewards.loading} error={stakeRewards.error} />
          <Pagination
            currentPage={stakePaginate.currentPage || stakePage}
            totalPages={stakePaginate.totalPages || 1}
            totalItems={stakePaginate.totalItems || 0}
            limit={params.limit}
            onPageChange={setStakePage}
          />
        </CardBody>
      </Card>

      {/* Sales */}
      <Card>
        <CardHeader
          title="Token Sales"
          subtitle={`${params.search === 'daily' ? "Today's" : ''} BRC token sales`}
          actions={
            <SearchInput value={saleSearch} onChange={handleSaleSearch} placeholder="Search username…" />
          }
        />
        <CardBody className="p-0">
          <Table columns={SALE_COLUMNS} data={saleKGC.data?.data || []} loading={saleKGC.loading} error={saleKGC.error} />
          <Pagination
            currentPage={salePaginate.currentPage || salePage}
            totalPages={salePaginate.totalPages || 1}
            totalItems={salePaginate.totalItems || 0}
            limit={params.limit}
            onPageChange={setSalePage}
          />
        </CardBody>
      </Card>
    </div>
  )
}
