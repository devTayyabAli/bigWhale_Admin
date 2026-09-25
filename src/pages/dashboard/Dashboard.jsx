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
import { formatDate, formatDateTime, roundTo } from '@/utils'
import { staggerContainer, staggerItem } from '@/animations'

const STAKE_COLUMNS = [
  { key: 'userName', header: 'User', render: (r) => r?.userId?.userName || r?.userName || '-' },
  { key: 'rewardAmount', header: `Reward ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r?.rewardAmount, ROUND_OFF_TO) },
  { key: 'stakeAmount', header: `Stake ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r?.stakeAmount, ROUND_OFF_TO) },
  { key: 'status', header: 'Status', render: (r) => <Badge status={r?.status} /> },
  { key: 'createdAt', header: 'Date', render: (r) => formatDateTime(r?.date || r?.createdAt) },
]

const SALE_COLUMNS = [
  { key: 'userName', header: 'User', render: (r) => r?.userId?.userName || r?.userName || '-' },
  { key: 'totalSaleAmount', header: `USDT ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r?.totalSaleAmount, ROUND_OFF_TO) },
  { key: 'createdAt', header: 'Date', render: (r) => formatDateTime(r?.createdAtDubai || r?.createdAtUtc || r?.createdAt) },
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

  // Reset pagination when filter criteria change
  useEffect(() => {
    setStakePage(1)
    setSalePage(1)
  }, [params.search, params.startDate, params.endDate])

  useEffect(() => {
    if (params.search === 'date range' && (!params.startDate || !params.endDate)) {
      return
    }
    dispatch(fetchDashboardStats({
      search: params.search === 'date range' ? null : params.search,
      startDate: params.startDate,
      endDate: params.endDate,
    }))
  }, [dispatch, params.search, params.startDate, params.endDate])

  useEffect(() => {
    if (params.search === 'date range' && (!params.startDate || !params.endDate)) {
      return
    }
    dispatch(fetchStakeRewards({
      ...params,
      search: params.search === 'date range' ? null : params.search,
      userName: stakeSearch || undefined,
      page: stakePage,
    }))
  }, [dispatch, params, stakeSearch, stakePage])

  useEffect(() => {
    if (params.search === 'date range' && (!params.startDate || !params.endDate)) {
      return
    }
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
  const stakeTotal = stakeRewards.data?.totalCount ?? stakePaginate.totalItems ?? 0
  const saleTotal  = saleKGC.data?.totalCount ?? salePaginate.totalItems ?? 0

  const filterPeriodLabel =
    params.search === 'daily'
      ? 'Today'
      : params.search === 'all'
      ? 'All Time'
      : params.search === 'weekly'
      ? 'This Week'
      : params.search === 'monthly'
      ? 'This Month'
      : 'Period'

  const activitySubtitle =
    params.search === 'daily'
      ? "Today's"
      : params.search === 'all'
      ? 'All time'
      : params.search === 'weekly'
      ? "This week's"
      : params.search === 'monthly'
      ? "This month's"
      : 'Selected period'

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
            title: `Global Turnover ${filterPeriodLabel} ${CURRENCY_SYMBOL}`,
            value: d?.totalGlobal != null ? roundTo(d.totalGlobal, ROUND_OFF_TO) : '-',
            icon: RefreshCcw, color: 'success',
          },
          {
            title: `Staking Rewards ${CURRENCY_SYMBOL}`,
            value: d?.totalUserStake?.totalAmount != null ? roundTo(d.totalUserStake.totalAmount, ROUND_OFF_TO) : '-',
            icon: TrendingUp, color: 'info',
          },
          {
            title: `Rewards Distributed ${CURRENCY_SYMBOL}`,
            value: d?.totalRewardDistribute?.totalAmount != null ? roundTo(d.totalRewardDistribute.totalAmount, ROUND_OFF_TO) : '-',
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
          subtitle={`${activitySubtitle} staking activity`}
          actions={
            <SearchInput value={stakeSearch} onChange={handleStakeSearch} placeholder="Search username…" />
          }
        />
        <CardBody className="p-0">
          <Table columns={STAKE_COLUMNS} data={stakeRewards.data?.userStakeReward || stakeRewards.data?.data || []} loading={stakeRewards.loading} error={stakeRewards.error} />
          <Pagination
            currentPage={stakePaginate.currentPage || stakePage}
            totalPages={stakePaginate.totalPages || 1}
            totalItems={stakeTotal}
            limit={params.limit}
            onPageChange={setStakePage}
          />
        </CardBody>
      </Card>

      {/* Sales */}
      <Card>
        <CardHeader
          title="Token Sales"
          subtitle={`${activitySubtitle} BW token sales`}
          actions={
            <SearchInput value={saleSearch} onChange={handleSaleSearch} placeholder="Search username…" />
          }
        />
        <CardBody className="p-0">
          <Table columns={SALE_COLUMNS} data={saleKGC.data?.salesData || saleKGC.data?.data || []} loading={saleKGC.loading} error={saleKGC.error} />
          <Pagination
            currentPage={salePaginate.currentPage || salePage}
            totalPages={salePaginate.totalPages || 1}
            totalItems={saleTotal}
            limit={params.limit}
            onPageChange={setSalePage}
          />
        </CardBody>
      </Card>
    </div>
  )
}
