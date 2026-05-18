import { useEffect, useState, memo } from 'react'
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

const COLUMNS = [
  {
    key: 'name',
    header: 'Member',
    render: (r) => (
      <div>
        <p className="font-medium text-bw-text text-sm">{r.name || '-'}</p>
        <p className="text-xs text-bw-muted">@{r.userName || '-'}</p>
      </div>
    ),
  },
  { key: 'email',     header: 'Email' },
  { key: 'level',     header: 'Level',  align: 'center', render: (r) => r.level ?? '-' },
  { key: 'status',    header: 'Status', align: 'center', render: (r) => <Badge status={r.status} /> },
  { key: 'createdAt', header: 'Joined', render: (r) => formatDate(r.createdAt) },
]

export default memo(function TeamsView() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { team } = useSelector((s) => s.users)
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(fetchUserTeam({ userId: id, params: { page, limit: 10 } }))
  }, [dispatch, id, page])

  const paginate = team.data?.paginate || {}

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader
        title="Team Members"
        backPath={`/users/user-details/${id}`}
        subtitle={`Total: ${paginate.totalItems ?? 0}`}
      />
      <Card>
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
            totalItems={paginate.totalItems || 0}
            limit={10}
            onPageChange={setPage}
          />
        </CardBody>
      </Card>
    </motion.div>
  )
})
