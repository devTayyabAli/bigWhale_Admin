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
import Select from '@/components/ui/Select'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/utils'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations'

// Server: GET /support/counts → { data: { totalInProgressTickets, totalTODOTickets, totalCompletedTickets, allTickets } }
// Server: GET /support/       → { data: tickets[] }  (flat array, no server-side pagination)

const STATUS_OPTIONS = [
  { value: 'all',         label: 'All Status' },
  { value: 'ToDo',        label: 'Todo' },
  { value: 'Pending',     label: 'In Progress' },
  { value: 'Completed',   label: 'Completed' },
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
  { key: 'subject',   header: 'Subject',  render: (r) => <SubjectCell id={r._id} subject={r.subject} /> },
  { key: 'user',      header: 'User',     render: (r) => r?.userId?.userName || r?.userId?.name || '-' },
  { key: 'priority',  header: 'Priority', render: (r) => r.priority || '-' },
  { key: 'status',    header: 'Status',   render: (r) => <Badge status={r.status?.toLowerCase()} /> },
  { key: 'createdAt', header: 'Created',  render: (r) => formatDate(r.createdAt) },
]


export default function SupportTickets() {
  const dispatch = useDispatch()
  const dashboard = useSelector(selectSupportDashboard)
  const tickets   = useSelector(selectSupportTickets)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { dispatch(fetchSupportDashboard()) }, [dispatch])
  useEffect(() => { dispatch(fetchSupportTickets()) }, [dispatch])

  const handleStatusChange = useCallback(
    (e) => setStatusFilter(e.target.value),
    []
  )

  // Server returns flat array — filter client-side
  const allTickets = tickets.data?.data || []
  const filtered   = statusFilter === 'all'
    ? allTickets
    : allTickets.filter((t) => t.status === statusFilter)

  const d = dashboard.data?.data || {}

  const STAT_CARDS = [
    { title: 'Active Tickets', value: d.totalInProgressTickets ?? 0, icon: Briefcase, color: 'primary' },
    { title: 'Todo Tickets',   value: d.totalTODOTickets ?? 0,       icon: FilePlus,  color: 'warning' },
    { title: 'Completed',      value: d.totalCompletedTickets ?? 0,  icon: Clipboard, color: 'success' },
    { title: 'All Tickets',    value: d.allTickets ?? 0,             icon: Database,  color: 'info'    },
  ]

  return (
    <motion.div {...fadeInUp} className="space-y-5 sm:space-y-6">
      <PageHeader title="Support Tickets" subtitle="Manage user support requests" />

      {/* Stats */}
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

      {/* Table */}
      <Card>
        <CardHeader
          title="Tickets"
          subtitle={`${filtered.length} tickets`}
          actions={
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full sm:w-40"
            />
          }
        />
        <CardBody className="p-0">
          <Table
            columns={COLUMNS}
            data={filtered}
            loading={tickets.loading}
            error={tickets.error}
            emptyMessage="No support tickets found."
          />
        </CardBody>
      </Card>
    </motion.div>
  )
}
