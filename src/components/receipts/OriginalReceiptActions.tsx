import { Download, Eye, FileText } from 'lucide-react'

import type { Receipt } from '../../types/receipt'
import { formatFileSize } from '../../types/receiptUpload'

import './OriginalReceiptActions.css'

interface OriginalReceiptActionsProps {
  receipt: Receipt
  onViewOriginal?: (receiptId: string) => void
  onDownloadOriginal?: (receiptId: string) => void
  disabled?: boolean
}

function OriginalReceiptActions({
  receipt,
  onViewOriginal,
  onDownloadOriginal,
  disabled = false,
}: OriginalReceiptActionsProps) {
  const original = receipt.originalReceipt

  return (
    <section className="original-receipt-section" aria-label="Original receipt">
      <div className="original-receipt-header">
        <FileText size={24} aria-hidden="true" />

        <div className="original-receipt-info">
          <h3>Original receipt</h3>

          {original ? (
            <>
              <span>{original.fileName}</span>

              <span className="original-receipt-size">{formatFileSize(original.sizeInBytes)}</span>
            </>
          ) : (
            <p>Original receipt is not available.</p>
          )}
        </div>
      </div>

      {original && (
        <div className="original-receipt-actions">
          <button
            type="button"
            disabled={disabled || !onViewOriginal}
            onClick={() => onViewOriginal?.(receipt.id)}
          >
            <Eye size={16} aria-hidden="true" />
            View original
          </button>

          <button
            type="button"
            disabled={disabled || !onDownloadOriginal}
            onClick={() => onDownloadOriginal?.(receipt.id)}
          >
            <Download size={16} aria-hidden="true" />
            Download
          </button>
        </div>
      )}
    </section>
  )
}

export default OriginalReceiptActions
