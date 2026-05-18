import { useEffect, useState, memo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserTeamReward } from '@/store/slices/usersSlice'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import PageHeader from '@/components/ui/PageHeader'
import DateTimeFilter from '@/components/ui/DateTimeFilter'
import { CURRENCY_SYMBOL, ROUND_OFF_TO } from '@/constants'
import { formatDate, roundTo } from '@/utils'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/animations'
import dayjs from 'dayjs'

const COLUMNS = [
  { key: 'level',      header: 'Level',                   align: 'center' },
  { key: 'memberName', header: 'Member',                  render: (r) => r.memberName || r.userName || '-' },
  { key: 'reward',     header: `Reward ${CURRENCY_SYMBOL}`, render: (r) => roundTo(r.reward || r.amount, ROUND_OFF_TO) },
  { key: 'date',       header: 'Date',                    render: (r) => formatDate(r.createdAt || r.date) },
]

export default memo(function UserTeamDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { teamReward } = useSelector((s) => s.users)

  const [params, setParams] = useState({
    search: 'daily',
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  })

  useEffect(() => {
    dispatch(fetchUserTeamReward({ userId: id, startDate: params.startDate, endDate: params.endDate }))
  }, [dispatch, id, params.startDate, params.endDate])

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader title="Team Reward Details" backPath={`/users/user-details/${id}`} />
      <Card>
        <CardHeader
          title="Team Rewards"
          actions={<DateTimeFilter params={params} setParams={setParams} />}
        />
        <CardBody className="p-0">
          <Table
            columns={COLUMNS}
            data={teamReward.data?.data || []}
            loading={teamReward.loading}
            error={teamReward.error}
            emptyMessage="No team reward data found."
          />
        </CardBody>
      </Card>
    </motion.div>
  )
})
