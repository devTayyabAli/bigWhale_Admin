import { useState, useEffect, useCallback } from 'react'
import {
  Key,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Database,
  CheckCircle,
} from 'react-feather'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ConfirmModal from '@/components/ui/ConfirmModal'
import {
  fetchOwnerWalletStatus,
  updateOwnerWalletKey,
  deleteOwnerWalletKey,
} from '@/services/ownerWallet'

export default function OwnerWalletCard() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Status state
  const [walletStatus, setWalletStatus] = useState({
    isConfigured: false,
    address: null,
    source: 'none',
    updatedAt: null,
  })

  // Form state
  const [privateKeyInput, setPrivateKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [inputError, setInputError] = useState('')
  const [copied, setCopied] = useState(false)

  // Fetch current status
  const loadStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchOwnerWalletStatus()
      const data = res?.data?.data || {}
      setWalletStatus({
        isConfigured: Boolean(data.isConfigured),
        address: data.address || null,
        source: data.source || 'none',
        updatedAt: data.updatedAt || null,
      })
    } catch (err) {
      console.error('Failed to fetch owner wallet status:', err)
      toast.error('Failed to load owner wallet status from server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  // Validate EVM private key (64 hex characters, optional 0x prefix)
  const validateKey = (val) => {
    if (!val || !val.trim()) {
      return 'Private key is required'
    }
    const clean = val.trim().replace(/^0x/i, '')
    if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
      return 'Invalid key format. Must be 64 hexadecimal characters (with or without 0x)'
    }
    return ''
  }

  // Handle Save / Encrypt
  const handleSaveKey = async (e) => {
    e.preventDefault()
    const err = validateKey(privateKeyInput)
    if (err) {
      setInputError(err)
      return
    }
    setInputError('')
    setSubmitting(true)

    try {
      const res = await updateOwnerWalletKey(privateKeyInput.trim())
      toast.success(res?.data?.message || 'Private key encrypted and saved successfully!')
      setPrivateKeyInput('')
      setShowKey(false)
      await loadStatus()
    } catch (err) {
      console.error('Error saving private key:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to encrypt and save private key'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      const res = await deleteOwnerWalletKey()
      toast.success(res?.data?.message || 'Owner private key removed from database')
      setIsDeleteModalOpen(false)
      await loadStatus()
    } catch (err) {
      console.error('Error deleting private key:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to remove private key'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (!walletStatus.address) return
    navigator.clipboard.writeText(walletStatus.address)
    setCopied(true)
    toast.success('Public address copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border border-bw-border shadow-xl">
      <CardHeader
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bw-primary/10 text-bw-primary">
              <Key size={20} />
            </div>
            <div>
              <span className="text-base font-bold text-bw-text">Owner Wallet & Private Key Vault</span>
              <p className="text-xs text-bw-muted font-normal">
                Encrypted on-chain signer credentials (AES-256-GCM)
              </p>
            </div>
          </div>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadStatus}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      <CardBody className="space-y-6">
        {/* Status & Public Address Display Banner */}
        <div className="p-4 rounded-2xl bg-bw-surface/80 border border-bw-border/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-bw-muted">
              Current Configuration Status
            </span>

            {/* Status Badges */}
            <div>
              {loading ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-bw-surface text-bw-muted border border-bw-border animate-pulse">
                  Checking status...
                </span>
              ) : walletStatus.isConfigured ? (
                walletStatus.source === 'database' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                    <Database size={13} />
                    Active in Database (AES-256-GCM Encrypted)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium">
                    <CheckCircle size={13} />
                    Active via Server Environment (.env)
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                  <AlertCircle size={13} />
                  Not Configured
                </span>
              )}
            </div>
          </div>

          {/* Derived Public Address */}
          <div>
            <label className="text-xs text-bw-muted font-medium block mb-1.5">
              Derived Public Wallet Address:
            </label>
            {walletStatus.address ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-xl bg-bw-card border border-bw-border/80">
                <code className="text-sm font-mono text-bw-primary break-all flex-1 select-all font-semibold">
                  {walletStatus.address}
                </code>
                <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <a
                    href={`https://bscscan.com/address/${walletStatus.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-bw-border text-bw-muted hover:text-bw-text hover:border-bw-primary transition-colors flex items-center justify-center min-h-[32px] min-w-[32px]"
                    title="View on BscScan"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-bw-muted italic">
                No active wallet key found. Enter a private key below to configure.
              </p>
            )}

            {walletStatus.updatedAt && (
              <p className="text-[11px] text-bw-muted mt-2">
                Last updated in database:{' '}
                <span className="text-bw-text-secondary">
                  {new Date(walletStatus.updatedAt).toLocaleString()}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Security Notice Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-bw-primary/5 border border-bw-primary/20">
          <Shield size={20} className="text-bw-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs text-bw-text-secondary leading-relaxed space-y-1">
            <p className="font-semibold text-bw-text">End-to-End Vault Security:</p>
            <p>
              When you submit a private key, the backend immediately encrypts it using{' '}
              <strong className="text-bw-primary">AES-256-GCM</strong> (military-grade authenticated encryption)
              with unique initialization vectors (IV). The raw private key is never saved as plain text and is{' '}
              <strong className="text-bw-text">never exposed back to any client or browser</strong>.
            </p>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSaveKey} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-bw-text flex items-center justify-between">
              <span>{walletStatus.isConfigured ? 'Update / Rotate Private Key' : 'Set New Private Key'}</span>
              <span className="text-xs text-bw-muted font-normal">Must be 64 hex characters</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bw-muted pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showKey ? 'text' : 'password'}
                value={privateKeyInput}
                onChange={(e) => {
                  setPrivateKeyInput(e.target.value)
                  if (inputError) setInputError('')
                }}
                placeholder="Enter 64-character EVM Private Key (0x...)"
                disabled={submitting}
                className={`bw-input min-h-[44px] pl-10 pr-12 font-mono text-sm w-full ${
                  inputError ? 'border-red-500 focus:border-red-500' : ''
                }`}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bw-muted hover:text-bw-text p-1 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {inputError && <p className="text-xs text-red-400 mt-1">{inputError}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Delete button (only visible if configured in DB) */}
            {walletStatus.source === 'database' ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={submitting || deleting}
                className="w-full sm:w-auto"
              >
                <Trash2 size={15} />
                <span>Delete Key from Database</span>
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              disabled={submitting || !privateKeyInput.trim()}
              className="w-full sm:w-auto"
            >
              <Lock size={15} />
              <span>Encrypt & Save in Database</span>
            </Button>
          </div>
        </form>
      </CardBody>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Owner Private Key?"
        message="Are you sure you want to remove the encrypted owner private key from the database? Automated on-chain operations (like contract withdrawals and distribution) will immediately fall back to environment variables or be paused until a new key is saved."
        confirmLabel="Yes, Delete Key"
        confirmVariant="danger"
      />
    </Card>
  )
}
