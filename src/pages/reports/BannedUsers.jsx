import { useEffect, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchBannedUsers } from '@/store/slices/usersSlice'
import { selectBannedUsers } from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import DateTimeFilter from '@/components/ui/DateTimeFilter'
import PageHeader from '@/components/ui/PageHeader'
import { useTableParams } from '@/hooks/useTableParams'
import { formatDateTime } from '@/utils'
import { fadeInUp } from '@/animations'

// Column definitions outside component — stable, never recreated
const COLUMNS = [
  {
    key: 'name',
    header: 'Name',
    render: (r) => (
      <div>
        <p className="font-medium text-bw-text">{r.name || '-'}</p>
        <p className="text-xs text-bw-muted">@{r.userName || '-'}</p>
      </div>
    ),
  },
  { key: 'email', header: 'Email' },
  { key: 'referrerUserName', header: 'Referral' },
  {
    key: 'bannedAt',
    header: 'Banned At',
    render: (r) => formatDateTime(r.bannedAt || r.updatedAt),
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    render: (r) => <Badge status={r.status} />,
  },
]

export default memo(function BannedUsers() {
  const dispatch = useDispatch()
  const bannedUsers = useSelector(selectBannedUsers)
  const { params, setParams, setPage } = useTableParams({
    search: 'daily',
    startDate: null,
    endDate: null,
  })

  useEffect(() => {
    dispatch(fetchBannedUsers(params))
  }, [dispatch, params])

  const paginate = bannedUsers.data?.paginate || {}

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Banned Users" subtitle="Users with banned status" />
      <Card>
        <CardHeader
          title="Banned Users"
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
            data={bannedUsers.data?.usersData || bannedUsers.data?.data || []}
            loading={bannedUsers.loading}
            error={bannedUsers.error}
            emptyMessage="No banned users found."
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
