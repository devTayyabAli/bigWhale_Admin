import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { MessageSquare, User, Calendar, Tag } from 'react-feather'
import { fetchTicketById, updateTicketStatus } from '@/store/slices/supportSlice'
import { selectActiveTicket } from '@/store/selectors'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations'

const STATUS_FLOW = ['ToDo', 'Pending', 'Completed']

export default function TicketView() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const activeTicket = useSelector(selectActiveTicket)

  useEffect(() => {
    dispatch(fetchTicketById(id))
  }, [dispatch, id])

  const ticket = activeTicket.data?.data || activeTicket.data

  const handleStatusChange = (newStatus) => {
    dispatch(updateTicketStatus({ id, body: { status: newStatus }, params: {} }))
      .then(() => dispatch(fetchTicketById(id)))
  }

  if (activeTicket.loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Ticket Details" backPath="/support-history" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <PageHeader title="Ticket Details" backPath="/support-history" />
        <div className="text-center py-16 text-bw-muted text-sm">Ticket not found.</div>
      </div>
    )
  }

  const currentStatusIdx = STATUS_FLOW.indexOf(ticket.status)

  return (
    <motion.div {...fadeInUp} className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Ticket Details"
        backPath="/support-history"
        actions={
          /* Status buttons — stack on mobile */
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FLOW.map((s, i) => (
              <Button
                key={s}
                size="sm"
                variant={ticket.status === s ? 'primary' : 'secondary'}
                disabled={i < currentStatusIdx}
                onClick={() => handleStatusChange(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        }
      />

      {/* Ticket header */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h2 className="text-base sm:text-lg font-bold text-bw-text">
                  {ticket.subject || ticket.title || 'Untitled Ticket'}
                </h2>
                <Badge status={ticket.status} />
              </div>
              {/* Meta row — wraps on mobile */}
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-bw-muted">
                <span className="flex items-center gap-1.5">
                  <User size={13} />
                  {ticket?.userId?.userName || ticket?.userName || 'Unknown'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Tag size={13} />
                  {ticket.category || 'General'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {ticket.description && (
            <div className="mt-4 p-3 sm:p-4 rounded-xl bg-bw-surface border border-bw-border">
              <p className="text-sm text-bw-text-secondary leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Attachments */}
      {ticket.attachments?.length > 0 && (
        <Card>
          <CardHeader title="Attachments" />
          <CardBody>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {ticket.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url || att}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bw-surface
                             border border-bw-border text-sm text-bw-primary
                             hover:border-bw-primary transition-colors"
                >
                  <MessageSquare size={13} />
                  {att.name || `Attachment ${i + 1}`}
                </a>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Conversation thread */}
      {ticket.messages?.length > 0 && (
        <Card>
          <CardHeader
            title="Conversation"
            subtitle={`${ticket.messages.length} messages`}
          />
          <CardBody>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {ticket.messages.map((msg, i) => {
                const isAdmin = msg.role === 'admin' || msg.senderRole === 'admin'
                return (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className={`flex gap-2 sm:gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={[
                        'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',
                        'text-white text-xs font-bold flex-shrink-0',
                        isAdmin ? 'bg-bw-gradient' : 'bg-bw-surface border border-bw-border',
                      ].join(' ')}
                    >
                      {isAdmin ? 'A' : (msg.senderName?.[0] || 'U').toUpperCase()}
                    </div>

                    {/* Bubble */}
                    <div
                      className={[
                        'max-w-[80%] sm:max-w-[75%] flex flex-col gap-1',
                        isAdmin ? 'items-end' : 'items-start',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed',
                          isAdmin
                            ? 'bg-bw-primary/10 border border-bw-primary/20 text-bw-text rounded-2xl rounded-tr-sm'
                            : 'bg-bw-surface border border-bw-border text-bw-text-secondary rounded-2xl rounded-tl-sm',
                        ].join(' ')}
                      >
                        {msg.message || msg.text}
                      </div>
                      <span className="text-xs text-bw-muted px-1">
                        {formatDateTime(msg.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </CardBody>
        </Card>
      )}
    </motion.div>
  )
}
