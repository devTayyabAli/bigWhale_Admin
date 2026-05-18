import { useEffect, useState, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, FilePlus, Clipboard, Database } from 'react-feather'
import { fetchSupportDashboard, fetchSupportTickets } from '@/store/slices/supportSlice'
import { selectSupportDashboard, selectSupportTickets } from '@/store/selectors'
import StatCard from '@/components/ui/StatCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import PageHeader from '@/components/ui/PageHeader'
import { formatDate } from '@/utils'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations'

const STATUS_OPTIONS = [
  { value: 'all',         label: 'All Status' },
  { value: 'todo',        label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
]

const SubjectCell = memo(function SubjectCell({ id, subject }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/support/ticket-details/${id}`)}
      className="text-bw-primary hover:underline text-sm font-medium text-left"
    >
      {subject || '-'}
    </button>
  )
})

const COLUMNS = [
  { key: 'subject',   header: 'Subject',  render: (r) => <SubjectCell id={r._id} subject={r.subject || r.title} /> },
  { key: 'user',      header: 'User',     render: (r) => r?.userId?.userName || r?.userName || '-' },
  { key: 'category',  header: 'Category', render: (r) => r.category || '-' },
  { key: 'status',    header: 'Status',   render: (r) => <Badge status={r.status} /> },
  { key: 'createdAt', header: 'Created',  render: (r) => formatDate(r.createdAt) },
]

const INITIAL_PARAMS = { page: 1, limit: 10, status: 'all' }

export default function SupportTickets() {
  const dispatch = useDispatch()
  const dashboard = useSelector(selectSupportDashboard)
  const tickets   = useSelector(selectSupportTickets)
  const [params, setParams] = useState(INITIAL_PARAMS)

  useEffect(() => { dispatch(fetchSupportDashboard()) }, [dispatch])
  useEffect(() => { dispatch(fetchSupportTickets(params)) }, [dispatch, params])

  const handleStatusChange = useCallback(
    (e) => setParams((p) => ({ ...p, status: e.target.value, page: 1 })),
    []
  )

  const d       = dashboard.data?.data || {}
  const paginate = tickets.data?.paginate || {}

  const STAT_CARDS = [
    { title: 'Active Tickets', value: d.totalInProgressTickets ?? 0, icon: Briefcase, color: 'primary' },
    { title: 'Todo Tickets',   value: d.totalTODOTickets ?? 0,       icon: FilePlus,  color: 'warning' },
    { title: 'Completed',      value: d.totalCompletedTickets ?? 0,  icon: Clipboard, color: 'success' },
    { title: 'All Tickets',    value: d.allTickets ?? 0,             icon: Database,  color: 'info'    },
  ]

  return (
    <motion.div {...fadeInUp} className="space-y-5 sm:space-y-6">
      <PageHeader title="Support Tickets" subtitle="Manage user support requests" />

      {/* Stats — 1 col mobile, 2 col sm, 4 col xl */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
      >
        {STAT_CARDS.map((card) => (
          <motion.div key={card.title} variants={staggerItem}>
            <StatCard {...card} loading={dashboard.loading} />
          </motion.div>
        ))}
      </motion.div>

      <Card>
        <CardHeader
          title="Tickets"
          actions={
            <Select
              options={STATUS_OPTIONS}
              value={params.status}
              onChange={handleStatusChange}
              className="w-full sm:w-40"
            />
          }
        />
        <CardBody className="p-0">
          <Table
            columns={COLUMNS}
            data={tickets.data?.data || []}
            loading={tickets.loading}
            error={tickets.error}
            emptyMessage="No support tickets found."
          />
          <Pagination
            currentPage={paginate.currentPage || params.page}
            totalPages={paginate.totalPages || 1}
            totalItems={paginate.totalItems || 0}
            limit={params.limit}
            onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
          />
        </CardBody>
      </Card>
    </motion.div>
  )
}
