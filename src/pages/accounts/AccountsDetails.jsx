import { useEffect, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchDailyUsers } from '@/store/slices/usersSlice'
import { selectDailyUsers } from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import DateTimeFilter from '@/components/ui/DateTimeFilter'
import PageHeader from '@/components/ui/PageHeader'
import { useTableParams } from '@/hooks/useTableParams'
import { formatDateTime } from '@/utils'
import { fadeInUp } from '@/animations'

const NameCell = memo(({ name }) => (
  <span className="font-medium text-bw-text text-sm">{name || '-'}</span>
))
NameCell.displayName = 'NameCell'

const UserNameCell = memo(({ id, userName }) => (
  <button
    onClick={() => window.open(`/users/user-details/${id}`, '_blank')}
    className="text-bw-primary hover:underline text-sm"
  >
    @{userName}
  </button>
))
UserNameCell.displayName = 'UserNameCell'

const COLUMNS = [
  { key: 'name',             header: 'Name',       render: (r) => <NameCell name={r.name} /> },
  { key: 'userName',         header: 'Username',   render: (r) => <UserNameCell id={r._id} userName={r.userName} /> },
  { key: 'email',            header: 'Email' },
  { key: 'referrerUserName', header: 'Referral' },
  { key: 'createdAt',        header: 'Registered', render: (r) => formatDateTime(r.createdAtPk || r.createdAt) },
  { key: 'status',           header: 'Status',     align: 'center', render: (r) => <Badge status={r.status} /> },
]

export default memo(function AccountsDetails() {
  const dispatch = useDispatch()
  const dailyUsers = useSelector(selectDailyUsers)
  const { params, setParams, setPage } = useTableParams({
    search: 'daily', startDate: null, endDate: null,
  })

  useEffect(() => { dispatch(fetchDailyUsers(params)) }, [dispatch, params])

  const paginate = dailyUsers.data?.paginate || {}

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader
        title="Accounts Details"
        subtitle={`Total Accounts: ${paginate.totalItems ?? 0}`}
      />
      <Card>
        <CardHeader
          title="User Registrations"
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
            data={dailyUsers.data?.usersData || []}
            loading={dailyUsers.loading}
            error={dailyUsers.error}
            emptyMessage="No accounts found for this period."
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
