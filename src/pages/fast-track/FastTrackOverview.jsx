import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Unlock, Award, Clock, DollarSign, RefreshCw, AlertCircle } from 'react-feather'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { getFastTrackStats, getFastTrackAudit, resyncAllRanks, resetRanksToQualification } from '@/services/fastTrack'
import { formatDate } from '@/utils'
import { fadeInUp } from '@/animations'

const num = (v, digits = 2) => Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: digits })

export default function FastTrackOverview() {
  const [stats, setStats] = useState(null)
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetReason, setResetReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, auditRes] = await Promise.all([getFastTrackStats(), getFastTrackAudit()])
      setStats(statsRes.data?.data || null)
      setAudit(auditRes.data?.data || [])
    } catch {
      toast.error('Failed to load 2X Fast-Track data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const runSync = async () => {
    setSyncing(true)
    try {
      const { data } = await resyncAllRanks()
      const r = data?.data || {}
      toast.success(`Rank sync done — ${r.sponsors || 0} sponsors checked, ${r.promoted || 0} promoted`)
      setConfirmOpen(false)
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Rank sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const runReset = async () => {
    if (resetReason.trim().length < 3) {
      toast.error('Enter a reason (at least 3 characters) first')
      return
    }
    setSyncing(true)
    try {
      const { data } = await resetRanksToQualification({ confirmReset: true, reason: resetReason.trim() })
      const r = data?.data || {}
      toast.success(`Reset done — ${r.changed || 0} users updated, ${r.cleared || 0} old ranks cleared`)
      setResetOpen(false)
      setResetReason('')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Rank reset failed')
    } finally {
      setSyncing(false)
    }
  }

  const ranks = stats?.ranks ? Object.entries(stats.ranks) : []
  const funnel = stats?.funnel || {}

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader
        title="2X Fast-Track"
        subtitle="5 BW stake · 10 BW once after 24h · 1 withdrawal of 10 BW per 24h"
        actions={
          <div className="flex gap-2">
            <Link to="/fast-track/settings">
              <Button variant="secondary" size="sm">Rank Settings</Button>
            </Link>
            <Button size="sm" variant="outline" onClick={() => setConfirmOpen(true)} loading={syncing}>
              <RefreshCw size={14} /> Re-sync Ranks
            </Button>
            <Button size="sm" variant="danger" onClick={() => setResetOpen(true)} disabled={syncing}>
              Reset Old Ranks
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="2X Unlocked Users" value={stats?.unlockedUsers ?? '-'} icon={Unlock} color="success" loading={loading} />
        <StatCard title="2X Paid (24h)" value={stats ? `${num(stats.payouts24h.amount)} BW` : '-'} icon={Zap} color="primary" loading={loading} />
        <StatCard title="Salary Pool (24h)" value={stats ? `${num(stats.salary24h.poolFee, 4)} BW` : '-'} icon={DollarSign} color="warning" loading={loading} />
        <StatCard title="Pending Withdrawals" value={stats?.pendingWithdrawals ?? '-'} icon={Clock} color="info" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Fast-Track Stakes" subtitle="One 5 BW stake pays 10 BW once, then closes" />
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                ['Paid out', stats?.stakes?.paid],
                ['Waiting 24h', stats?.stakes?.waiting24h],
                ['Waiting unlock', stats?.stakes?.waitingUnlock],
                ['Pending on-chain', stats?.stakes?.pending],
              ].map(([label, value]) => (
                <div key={label} className="p-3 rounded-xl bg-bw-surface border border-bw-border">
                  <p className="text-xl font-bold text-bw-text">{loading ? '…' : value ?? 0}</p>
                  <p className="text-xs text-bw-muted mt-1">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-bw-muted mt-3">
              Total staked: <span className="text-bw-text font-medium">{num(stats?.stakes?.stakedAmount)} BW</span>
              {' · '}2X payouts (24h): <span className="text-bw-text font-medium">{stats?.payouts24h?.count ?? 0}</span>
              {' · '}Salary paid: <span className="text-bw-text font-medium">{num(stats?.salary24h?.amount, 4)} BW</span>
              {' · '}Kept by company: <span className="text-bw-text font-medium">{num(stats?.salary24h?.retained, 4)} BW</span>
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Rank Holders" subtitle="Lifetime ranks from staked direct members" />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {ranks.map(([key, rank]) => (
                  <tr key={key} className="border-b border-bw-border last:border-0">
                    <td className="px-5 py-2.5 text-bw-text">Rank {key}</td>
                    <td className="px-5 py-2.5 text-bw-muted">{rank.title}</td>
                    <td className="px-5 py-2.5 text-right font-semibold text-bw-primary">{rank.count}</td>
                  </tr>
                ))}
                {!loading && ranks.length === 0 && (
                  <tr><td className="px-5 py-4 text-bw-muted text-center">No rank data yet.</td></tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Unlock Funnel" subtitle="Users who still have fewer than 5 staked directs" />
        <CardBody>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className="p-3 rounded-xl bg-bw-surface border border-bw-border">
                <p className="text-lg font-bold text-bw-text">{loading ? '…' : funnel[n] ?? 0}</p>
                <p className="text-xs text-bw-muted mt-1">{n} direct{n === 1 ? '' : 's'}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Admin Activity"
          actions={<Award size={15} className="text-bw-primary" />}
          subtitle="Rank edits, credit changes, window resets and sync runs"
        />
        <CardBody className="p-0">
          {audit.length === 0 ? (
            <p className="px-5 py-6 text-sm text-bw-muted text-center">No admin actions recorded yet.</p>
          ) : (
            <ul className="divide-y divide-bw-border">
              {audit.map((log) => (
                <li key={log._id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-bw-primary">{log.title}</span>
                    <span className="text-xs text-bw-muted flex-shrink-0">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="text-sm text-bw-text-secondary mt-1 break-words">{log.error}</p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-bw-primary/5 border border-bw-primary/20 text-xs text-bw-muted">
        <AlertCircle size={13} className="text-bw-primary mt-0.5 flex-shrink-0" />
        <p>
          Re-sync only promotes users — a rank never goes down. It counts directs who have
          confirmed at least one stake, and unlocks 2X at 5 of them.
        </p>
      </div>

      {resetOpen && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
          <p className="text-sm text-red-300">
            This sets every user rank and 2X unlock to exactly what their staked directs qualify
            them for. Old turnover ranks that no longer qualify are cleared and this cannot be undone.
          </p>
          <input
            className="bw-input w-full text-sm h-[38px]"
            placeholder="Reason for this reset"
            value={resetReason}
            onChange={(e) => setResetReason(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setResetOpen(false)} disabled={syncing}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={runReset} loading={syncing}>
              Reset Ranks
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={runSync}
        loading={syncing}
        confirmVariant="primary"
        confirmLabel="Run Sync"
        title="Re-sync all ranks?"
        message="Every sponsor's rank and 2X unlock will be recomputed from their staked directs. Ranks only move up."
      />
    </motion.div>
  )
}
