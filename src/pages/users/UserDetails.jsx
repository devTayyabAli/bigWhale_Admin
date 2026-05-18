import { useEffect, useState, useMemo, memo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Star, Shield, CreditCard } from 'react-feather'
import {
  fetchSingleUser,
  fetchUserStakingList,
  fetchUserRewards,
  fetchUserWithdrawals,
  fetchUserSales,
  fetchUserFundTransfers,
  fetchUserRank,
  updateWithdrawStatus,
} from '@/store/slices/usersSlice'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { CURRENCY_SYMBOL, ROUND_OFF_TO } from '@/constants'
import { formatDate, roundTo, truncateAddress } from '@/utils'
import { staggerContainer, staggerItem } from '@/animations'

const TABS = ['Staking', 'Rewards', 'Withdrawals', 'Sales', 'Fund Transfers']

const InfoRow = memo(function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon size={14} className="text-bw-muted flex-shrink-0 mt-0.5" />
      <span className="text-xs text-bw-muted flex-shrink-0">{label}:</span>
      <span className="text-sm text-bw-text truncate">{value || '-'}</span>
    </div>
  )
})

export default function UserDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { singleUser, staking, rewards, withdrawals, sales, fundTransfers, userRank } =
    useSelector((s) => s.users)

  const [activeTab, setActiveTab] = useState('Staking')
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(fetchSingleUser(id))
    dispatch(fetchUserRank(id))
  }, [dispatch, id])

  useEffect(() => {
    const p = { page, limit: 10 }
    const actions = {
      Staking: () => dispatch(fetchUserStakingList({ userId: id, params: p })),
      Rewards: () => dispatch(fetchUserRewards({ userId: id, params: p })),
      Withdrawals: () => dispatch(fetchUserWithdrawals({ userId: id, params: p })),
      Sales: () => dispatch(fetchUserSales({ userId: id, params: p })),
      'Fund Transfers': () => dispatch(fetchUserFundTransfers({ userId: id, params: p })),
    }
    actions[activeTab]?.()
  }, [dispatch, id, activeTab, page])

  const user = singleUser.data?.data || singleUser.data?.user || singleUser.data?.data


  const tabData = useMemo(() => ({
    Staking: {
      state: staking,
      columns: [
        { key: 'amount', header: `Amt ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.amount, ROUND_OFF_TO) },
        { key: 'tokens', header: 'BRC', render: (r) => roundTo(r.tokens, ROUND_OFF_TO) },
        { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
      ],
    },
    Rewards: {
      state: rewards,
      columns: [
        { key: 'amount', header: `Amt ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.amount, ROUND_OFF_TO) },
        { key: 'type', header: 'Type', render: (r) => r.type || '-' },
        { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
      ],
    },
    Withdrawals: {
      state: withdrawals,
      columns: [
        { key: 'amount', header: `Amt ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.amount, ROUND_OFF_TO) },
        { key: 'walletAddress', header: 'Wallet', render: (r) => truncateAddress(r.walletAddress) },
        { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
        {
          key: 'action', header: 'Action',
          render: (r) => r.status === 'pending' ? (
            <Button size="xs" variant="success"
              onClick={() => dispatch(updateWithdrawStatus({ id: r._id, body: { status: 'approved' } }))}>
              Approve
            </Button>
          ) : null,
        },
      ],
    },
    Sales: {
      state: sales,
      columns: [
        { key: 'tokens', header: 'BW', render: (r) => roundTo(r?.transaction?.cryptoAmount, ROUND_OFF_TO) },
        { key: 'amount', header: `Amt ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.amount, ROUND_OFF_TO) },
        { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
      ],
    },
    'Fund Transfers': {
      state: fundTransfers,
      columns: [
        { key: 'amount', header: `Amt ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.amount, ROUND_OFF_TO) },
        { key: 'type', header: 'Type', render: (r) => r.type || '-' },
        { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
        { key: 'createdAt', header: 'Date', render: (r) => formatDate(r.createdAt) },
      ],
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [staking, rewards, withdrawals, sales, fundTransfers, dispatch, id])

  const current = tabData[activeTab]
  const paginate = current?.state?.data?.paginate || {}

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="User Details" backPath="/users/all-users" />

      {/* Profile card */}
      {singleUser.loading ? (
        <SkeletonCard />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Identity — full width on mobile, 2/3 on lg */}
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <Card>
              <CardBody>
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-bw-gradient flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0 overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-bw-text">{user?.name || '-'}</h2>
                      <Badge status={user?.status} />
                    </div>
                    <p className="text-bw-muted text-sm">@{user?.userName || '-'}</p>
                    {/* Info grid — 1 col on mobile, 2 col on sm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
                      <InfoRow icon={Mail} label="Email" value={user?.email} />
                      <InfoRow icon={Phone} label="Phone" value={user?.phoneNumber || 'N/A'} />
                      <InfoRow icon={CreditCard} label="Wallet" value={truncateAddress(user?.walletAddress)} />
                      <InfoRow icon={User} label="Referrer" value={user?.referredBy?.userName || 'N/A'} />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Rank card */}
          <motion.div variants={staggerItem}>
            <Card className="h-full">
              <CardHeader title="Rank & Status" />
              <CardBody className="space-y-3">
                <InfoRow icon={Star} label="Rank" value={userRank.data?.rank?.title || 'No Rank'} />
                <InfoRow icon={Shield} label="Role" value={user?.role || '-'} />
                <InfoRow icon={User} label="Joined" value={formatDate(user?.createdAt)} />
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Tabs — horizontally scrollable on mobile */}
      <Card>
        <div className="flex overflow-x-auto scrollbar-hide border-b border-bw-border px-2 sm:px-4 gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1) }}
              className={[
                'px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap',
                'border-b-2 transition-colors flex-shrink-0',
                activeTab === tab
                  ? 'border-bw-primary text-bw-primary'
                  : 'border-transparent text-bw-muted hover:text-bw-text',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>
        <CardBody className="p-0">
          <Table
            columns={current.columns}
            data={current.state?.data?.data || []}
            loading={current.state?.loading}
            error={current.state?.error}
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
    </div>
  )
}
