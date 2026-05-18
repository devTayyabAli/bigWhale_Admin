import { AlertTriangle } from 'react-feather'
import Modal, { ModalFooter } from './Modal'
import Button from './Button'

/**
 * Generic confirmation modal.
 * ModalFooter stacks buttons vertically on mobile.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={28} className="text-amber-400" />
        </div>
        {message && (
          <p className="text-sm text-bw-text-secondary text-center leading-relaxed">
            {message}
          </p>
        )}
      </div>
      <ModalFooter>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading} fullWidth>
          Cancel
        </Button>
        <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading} fullWidth>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
