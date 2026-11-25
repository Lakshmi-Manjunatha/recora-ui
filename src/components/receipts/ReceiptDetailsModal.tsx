import { useEffect, useRef, useState } from 'react'
import { ReceiptText, X } from 'lucide-react'

import { formatAmount, formatReceiptDate } from '../../types/receipt'

import type { Receipt } from '../../types/receipt'
import './ReceiptModals.css'

interface ReceiptDetailsModalProps {
  receipt: Receipt
  onClose: () => void
  onEdit?: (receipt: Receipt) => void
  onDelete?: (receipt: Receipt) => Promise<void>
}

function ReceiptDetailsModal({ receipt, onClose, onEdit, onDelete }: ReceiptDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()

    return () => {
      dialog?.close()
    }
  }, [])

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return

    setIsDeleting(true)
    setError(null)

    try {
      await onDelete(receipt)
      onClose()
    } catch {
      setError('Unable to delete the receipt. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="receipt-modal"
      aria-labelledby="receipt-details-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!isDeleting) onClose()
      }}
    >
      <div className="receipt-modal-header">
        <h2 id="receipt-details-title">Receipt details</h2>

        <button
          className="receipt-modal-close"
          type="button"
          aria-label="Close receipt details"
          disabled={isDeleting}
          onClick={onClose}
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="receipt-details-merchant">
        <span className="receipts-icon">
          <ReceiptText size={24} aria-hidden="true" />
        </span>

        <div>
          <h3>{receipt.merchant}</h3>

          <p>
            {formatReceiptDate(receipt.purchaseDate)}
            {' · '}
            {receipt.category}
          </p>
        </div>
      </div>

      <section className="receipt-details-items" aria-labelledby="receipt-items-title">
        <h3 id="receipt-items-title">Purchased items</h3>

        {receipt.items.length === 0 ? (
          <p>No purchased items available.</p>
        ) : (
          <ul>
            {receipt.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name} × {item.quantity}
                </span>

                <strong>{formatAmount(item.totalAmount)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="receipt-details-total">
        <span>Total amount</span>
        <strong>{formatAmount(receipt.totalAmount)}</strong>
      </div>

      {error && (
        <p className="receipt-modal-error" role="alert">
          {error}
        </p>
      )}

      {confirmDelete ? (
        <div className="receipt-delete-confirmation">
          <p>Delete this receipt permanently?</p>

          <div className="receipt-modal-actions">
            <button
              className="receipts-secondary-button"
              type="button"
              disabled={isDeleting}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>

            <button
              className="receipt-danger-button"
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Deleting...' : 'Confirm delete'}
            </button>
          </div>
        </div>
      ) : (
        <div className="receipt-modal-actions">
          <button
            className="receipts-secondary-button"
            type="button"
            disabled={!onEdit}
            onClick={() => {
              onClose()
              onEdit?.(receipt)
            }}
          >
            Edit receipt
          </button>

          <button
            className="receipt-danger-button"
            type="button"
            disabled={!onDelete}
            onClick={() => setConfirmDelete(true)}
          >
            Delete receipt
          </button>
        </div>
      )}
    </dialog>
  )
}

export default ReceiptDetailsModal
