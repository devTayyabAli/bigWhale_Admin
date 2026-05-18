import { useEffect, useState, useCallback, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, ToggleLeft, ToggleRight, Users } from 'react-feather'
import { motion } from 'framer-motion'
import { fetchAllUsers, updateUserStatus } from '@/store/slices/usersSlice'
import {
  selectAllUsersData,
  selectAllUsersPaginate,
  selectAllUsersLoading,
  selectAllUsers,
} from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import ConfirmModal from '@/components/ui/ConfirmModal'
import PageHeader from '@/components/ui/PageHeader'
import { useDebounce } from '@/hooks/useDebounce'
import { USER_STATUS_OPTIONS } from '@/constants'
import { capitalizeWords } from '@/utils'
import { fadeInUp } from '@/animations'

const ActionCell = memo(function ActionCell({ row, onToggle }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        title="View Details"
        onClick={() => window.open(`/users/user-details/${row._id}`, '_blank')}
        className="p-2 rounded-lg text-bw-primary hover:bg-bw-primary/10 transition-colors"
      >
        <Eye size={15} />
      </button>
      <button
        title={row.status === 'active' ? 'Ban User' : 'Activate User'}
        onClick={() => onToggle(row)}
        className={`p-2 rounded-lg transition-colors ${
          row.status === 'active'
            ? 'text-emerald-400 hover:bg-emerald-500/10'
            : 'text-red-400 hover:bg-red-500/10'
        }`}
      >
        {row.status === 'active' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
      </button>
    </div>
  )
})

export default function AllUsers() {
  const dispatch = useDispatch()
  const usersData = useSelector(selectAllUsersData)
  const paginate = useSelector(selectAllUsersPaginate)
  const loading = useSelector(selectAllUsersLoading)
  const { error } = useSelector(selectAllUsers)

  const [confirmModal, setConfirmModal] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 400)

  const params = { page, limit: 10, search: debouncedSearch || null, status }

  useEffect(() => {
    dispatch(fetchAllUsers(params))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, debouncedSearch, status])

  const handleToggle = useCallback((row) => setConfirmModal(row), [])

  const handleConfirm = useCallback(() => {
    if (!confirmModal) return
    dispatch(
      updateUserStatus({
        id: confirmModal._id,
        body: { status: confirmModal.status === 'active' ? 'banned' : 'active' },
        persistedParams: params,
      })
    )
    setConfirmModal(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmModal, dispatch])

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (r) => (
        <div>
          <p className="font-medium text-bw-text text-sm">{r.name || '-'}</p>
          <p className="text-xs text-bw-muted">{r.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'Username',
      render: (r) => <span className="text-sm">@{r.userName || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: 'team',
      header: 'Team',
      align: 'center',
      render: (r) => (
        <Button
          variant="outline"
          size="xs"
          onClick={() => window.open(`/users/user-teams/${r._id}?direct`, '_blank')}
        >
          Teams
        </Button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (r) => <ActionCell row={r} onToggle={handleToggle} />,
    },
  ]

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader
        title="All Users"
        subtitle={`${paginate.totalItems ?? 0} total users`}
        actions={<Users size={18} className="text-bw-primary" />}
      />

      <Card>
        <CardHeader
          title="Users"
          actions={
            /* Responsive filter row — stacks on mobile */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Select
                options={USER_STATUS_OPTIONS.map((o) => ({ value: o, label: capitalizeWords(o) }))}
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                className="w-full sm:w-36"
              />
              <input
                className="bw-input text-sm w-full sm:w-48"
                placeholder="Search users…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          }
        />
        <CardBody className="p-0">
          <Table
            columns={columns}
            data={usersData}
            loading={loading}
            error={error}
            emptyMessage="No users found."
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

      <ConfirmModal
        isOpen={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirm}
        title="Change User Status"
        message={
          confirmModal
            ? `Are you sure you want to ${
                confirmModal.status === 'active' ? 'ban' : 'activate'
              } ${confirmModal.name || 'this user'}?${
                confirmModal.status === 'active'
                  ? ' This will deactivate all their active stakings and remove their rank.'
                  : ' This will resume all their active stakings and rank.'
              }`
            : ''
        }
        confirmLabel={confirmModal?.status === 'active' ? 'Ban User' : 'Activate User'}
        confirmVariant={confirmModal?.status === 'active' ? 'danger' : 'success'}
      />
    </motion.div>
  )
}
