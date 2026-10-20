import { useCallback, useEffect, useState } from 'react'
import { Zap, RefreshCw, RotateCcw } from 'react-feather'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  getUserFastTrack,
  setUserCredits,
  resetUserWindow,
  resyncUserRank,
} from '@/services/fastTrack'
import { formatDate } from '@/utils'

const windowLabel = (ms) => {
  if (!ms) return 'Available now'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.ceil((ms % 3_600_000) / 60_000)
  return `Used — next in ${h}h ${m}m`
}

/**
 * 2X Fast-Track status and admin actions for one user.
 */
export default function FastTrackCard({ userId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await getUserFastTrack(userId)
      const d = res?.data || null
      setData(d)
      setCredits(String(d?.user?.unusedDirectCount ?? 0))
    } catch {
      toast.error('Failed to load fast-track status')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const run = async (action) => {
    if (reason.trim().length < 3 && action !== 'resync') {
      toast.error('Enter a reason (at least 3 characters) first')
      return
    }
    setBusy(true)
    try {
      if (action === 'credits') {
        await setUserCredits(userId, { unusedDirectCount: Number(credits), reason: reason.trim() })
        toast.success('Withdrawal credits updated')
      } else if (action === 'window') {
        await resetUserWindow(userId, { reason: reason.trim() })
        toast.success('24h window reset')
      } else {
        await resyncUserRank(userId)
        toast.success('Rank re-synced')
      }
      setReason('')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  const u = data?.user
  const unlocked = Boolean(u?.is2XDailyUnlocked)

  return (
    <Card>
      <CardHeader
        title="2X Fast-Track"
        subtitle="Stake 5 BW · earn 10 BW once, 24h after unlock · withdraw 10 BW per 24h"
        actions={<Zap size={16} className="text-bw-primary" />}
      />
      <CardBody>
        {loading ? (
          <p className="text-sm text-bw-muted">Loading…</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['2X Status', unlocked ? 'Unlocked' : 'Locked'],
                ['Staked Directs', `${data?.stakedDirects ?? 0} / ${data?.unlockTarget ?? 5}`],
                ['Rank', u?.userRankId ? `Rank ${u.userRankId}${data?.rankTitle ? ` · ${data.rankTitle}` : ''}` : 'None'],
                ['Next Rank At', data?.nextRankTarget ? `${data.nextRankTarget} directs` : 'Top rank'],
                ['Withdrawal Credits', u?.unusedDirectCount ?? 0],
                ['24h Window', windowLabel(data?.windowRemainingMs)],
                ['Last Withdrawal', u?.lastWithdrawalAt ? formatDate(u.lastWithdrawalAt) : 'Never'],
                ['Computed Rank', data?.computedRank ? `Rank ${data.computedRank}` : 'None yet'],
              ].map(([label, value]) => (
                <div key={label} className="p-3 rounded-xl bg-bw-surface border border-bw-border">
                  <p className="text-xs text-bw-muted">{label}</p>
                  <p className="text-sm font-semibold text-bw-text mt-1 break-words">{value}</p>
                </div>
              ))}
            </div>

            {data?.stakes?.length > 0 && (
              <div className="text-xs text-bw-muted">
                Recent fast-track stakes:{' '}
                {data.stakes.map((s) => (
                  <span key={s._id} className="inline-block mr-2">
                    {s.amount} BW · {s.fastTrackPaidAt ? 'paid' : s.status}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto_auto_auto] gap-2 items-end">
              <label className="text-xs text-bw-muted">
                Credits
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="bw-input w-full text-sm h-[38px] mt-1"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                />
              </label>
              <label className="text-xs text-bw-muted">
                Reason (required for credits and window reset)
                <input
                  className="bw-input w-full text-sm h-[38px] mt-1"
                  placeholder="Why is this change needed?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <Button size="sm" onClick={() => run('credits')} loading={busy} disabled={busy}>Save Credits</Button>
              <Button size="sm" variant="secondary" onClick={() => run('window')} disabled={busy}>
                <RotateCcw size={13} /> Reset 24h
              </Button>
              <Button size="sm" variant="outline" onClick={() => run('resync')} disabled={busy}>
                <RefreshCw size={13} /> Re-sync Rank
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
