import { useEffect, useState, memo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserTeam } from '@/store/slices/usersSlice'
import { Card, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import PageHeader from '@/components/ui/PageHeader'
import { formatDate } from '@/utils'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/animations'

// ─── Type filter tabs ─────────────────────────────────────────────────────────
const TYPE_TABS = [
  { value: '',               label: 'All' },
  { value: 'direct',         label: 'Direct' },
  { value: 'directActive',   label: 'Direct Active' },
  { value: 'directPending',  label: 'Direct Pending' },
  { value: 'downlineActive', label: 'Downline Active' },
  { value: 'downlinePending',label: 'Downline Pending' },
]

// ─── Table columns ────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: 'name',
    header: 'Member',
    render: (r) => (
      <div>
      
        <p className="font-medium text-bw-text text-sm">{r?.user?.name || '-'}</p>
        <p className="text-xs text-bw-muted">@{r?.user?.userName || '-'}</p>
      </div>
    ),
  },
  { key: 'email',     header: 'Email', render: (r) => (
      <span className="text-xs text-bw-muted">
      {r.user?.email ?? '-'}
      </span>
    ), },
  {
    key: 'level',
    header: 'Level',
    align: 'center',
    render: (r) => (
      <span className="bw-badge bg-bw-primary/10 text-bw-primary">
        L{r.level ?? '-'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (r) => <Badge status={r?.user?.status} />,
  },
  { key: 'createdAt', header: 'Joined', render: (r) => formatDate(r?.user?.createdAt) },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default memo(function TeamsView() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { team } = useSelector((s) => s.users)
  const [page, setPage] = useState(1)
  const [activeType, setActiveType] = useState('')   // '' = all

  // Fetch whenever page or type changes
  useEffect(() => {
    dispatch(
      fetchUserTeam({
        userId: id,
        params: {
          page,
          limit: 10,
          ...(activeType && { type: activeType }),
        },
      })
    )
  }, [dispatch, id, page, activeType])

  const handleTypeChange = useCallback((value) => {
    setActiveType(value)
    setPage(1)          // reset to page 1 on filter change
  }, [])

  const paginate = team.data?.paginate || {}
  const totalItems = paginate.totalItems ?? team.data?.total ?? 0
// console.log("team",team.data?.data[0]?.user)
  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader
        title="Team Members"
        backPath={`/users/user-details/${id}`}
        subtitle={`Total: ${totalItems}`}
      />

      <Card>
        {/* ── Type filter tabs ── */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-bw-border px-2 gap-0.5">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTypeChange(tab.value)}
              className={[
                'px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap',
                'border-b-2 transition-colors flex-shrink-0',
                activeType === tab.value
                  ? 'border-bw-primary text-bw-primary'
                  : 'border-transparent text-bw-muted hover:text-bw-text',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <CardBody className="p-0">
          <Table
            columns={COLUMNS}
            data={team.data?.data || []}
            loading={team.loading}
            error={team.error}
            emptyMessage="No team members found."
          />
          <Pagination
            currentPage={paginate.currentPage || page}
            totalPages={paginate.totalPages || 1}
            totalItems={totalItems}
            limit={10}
            onPageChange={setPage}
          />
        </CardBody>
      </Card>
    </motion.div>
  )
})
