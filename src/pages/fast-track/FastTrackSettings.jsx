import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Info } from 'react-feather'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import { getFastTrackRanks, updateFastTrackRanks } from '@/services/fastTrack'
import { fadeInUp } from '@/animations'

const POOL = 20

export default function FastTrackSettings() {
  const [rows, setRows] = useState([])
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getFastTrackRanks()
      .then(({ data }) => {
        const list = data?.data?.ranks || []
        setRules(data?.data?.rules || null)
        setRows(list.map((r) => ({
          starKey: r.starKey,
          title: r.displayTitle || r.title,
          rewardPercentage: String(r.nominalPercentage ?? r.rewardPercentage ?? ''),
          directTeam: String(r.directTeam ?? ''),
        })))
      })
      .catch(() => toast.error('Failed to load ranks'))
      .finally(() => setLoading(false))
  }, [])

  const nominalSum = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.rewardPercentage) || 0), 0),
    [rows]
  )
  const scale = nominalSum > POOL ? POOL / nominalSum : 1
  const capped = scale < 1

  const updateRow = (starKey, field, value) =>
    setRows((prev) => prev.map((r) => (r.starKey === starKey ? { ...r, [field]: value } : r)))

  const save = async () => {
    for (const r of rows) {
      const pct = Number(r.rewardPercentage)
      const directs = Number(r.directTeam)
      if (!(pct > 0 && pct <= 100)) {
        toast.error(`Rank ${r.starKey}: percentage must be between 0 and 100`)
        return
      }
      if (!Number.isInteger(directs) || directs < 1) {
        toast.error(`Rank ${r.starKey}: direct members must be a whole number`)
        return
      }
    }
    setSaving(true)
    try {
      const { data } = await updateFastTrackRanks(
        rows.map((r) => ({
          starKey: r.starKey,
          rewardPercentage: Number(r.rewardPercentage),
          directTeam: Number(r.directTeam),
        }))
      )
      toast.success('Ranks updated')
      const list = data?.data?.ranks || []
      setRows(list.map((r) => ({
        starKey: r.starKey,
        title: r.displayTitle || r.title,
        rewardPercentage: String(r.nominalPercentage ?? r.rewardPercentage ?? ''),
        directTeam: String(r.directTeam ?? ''),
      })))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update ranks')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div {...fadeInUp} className="space-y-4">
      <PageHeader
        title="Fast-Track Rank Settings"
        subtitle="Edit each rank's direct-member target and its share of community withdrawals"
        backPath="/fast-track"
        actions={
          <Button size="sm" onClick={save} loading={saving} disabled={loading || rows.length === 0}>
            <Save size={14} /> Save Ranks
          </Button>
        }
      />

      <div className="flex items-start gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200">
        <Info size={16} className="mt-0.5 flex-shrink-0" />
        <div>
          <p>
            Only <span className="font-semibold">{POOL}%</span> of each withdrawal is kept for salaries.
            The percentages below are nominal. While their total stays within {POOL}% they are paid in
            full; once the total passes {POOL}% every achieved rank is scaled down so the payout never
            exceeds the fee.
          </p>
          <p className="mt-1.5">
            Nominal total now: <span className="font-semibold text-bw-text">{nominalSum.toFixed(2)}%</span>
            {' · '}Effective scale: <span className="font-semibold text-bw-text">{capped ? `${(scale * 100).toFixed(1)}% of nominal` : '100% (no cap)'}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Ranks 1 – 7"
          subtitle={rules ? `2X unlocks at ${rules.unlockDirects} staked directs · stake is fixed at ${rules.stakeAmount} BW` : ''}
        />
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-bw-muted border-b border-bw-border">
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Direct Members Required</th>
                <th className="px-5 py-3 font-medium">Nominal %</th>
                <th className="px-5 py-3 font-medium text-right">Paid % (after cap)</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-bw-muted">Loading…</td></tr>
              )}
              {rows.map((r) => {
                const effective = (Number(r.rewardPercentage) || 0) * scale
                return (
                  <tr key={r.starKey} className="border-b border-bw-border last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-bw-text">Rank {r.starKey}</p>
                      <p className="text-xs text-bw-muted">{r.title}</p>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="bw-input w-32 text-sm h-[36px]"
                        value={r.directTeam}
                        onChange={(e) => updateRow(r.starKey, 'directTeam', e.target.value)}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        className="bw-input w-28 text-sm h-[36px]"
                        value={r.rewardPercentage}
                        onChange={(e) => updateRow(r.starKey, 'rewardPercentage', e.target.value)}
                      />
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-400">
                      {effective.toFixed(3)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <p className="text-xs text-bw-muted">
        Saved direct-member targets apply immediately to new promotions. Ranks already earned are
        lifetime and are never removed.
      </p>
    </motion.div>
  )
}
