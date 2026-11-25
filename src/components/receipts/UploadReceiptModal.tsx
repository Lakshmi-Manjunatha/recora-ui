import { useEffect, useRef, useState } from 'react'
import { CloudUpload, FileText, X } from 'lucide-react'
import './ReceiptModals.css'

interface UploadReceiptModalProps {
  onClose: () => void
  onUpload?: (file: File) => Promise<void>
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

function UploadReceiptModal({ onClose, onUpload }: UploadReceiptModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()

    return () => {
      dialog?.close()
    }
  }, [])

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelection = (selectedFile?: File) => {
    setError(null)
    setFile(null)

    if (!selectedFile) return

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError('Please select a PDF, JPEG or PNG file.')
      resetFileInput()
      return
    }

    if (selectedFile.size === 0) {
      setError('The selected file is empty.')
      resetFileInput()
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('The file size must not exceed 10 MB.')
      resetFileInput()
      return
    }

    setFile(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    resetFileInput()
    fileInputRef.current?.focus()
  }

  const handleUpload = async () => {
    if (!file || !onUpload || isUploading) return

    setIsUploading(true)
    setError(null)

    try {
      await onUpload(file)
      onClose()
    } catch {
      setError('Unable to upload the receipt. Please try again.')
      setIsUploading(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="receipt-modal"
      aria-labelledby="upload-receipt-title"
      onCancel={(event) => {
        event.preventDefault()

        if (!isUploading) onClose()
      }}
    >
      <div className="receipt-modal-header">
        <h2 id="upload-receipt-title">Upload receipt</h2>
      </div>

      <p className="receipt-modal-description">Select a receipt to add to your collection.</p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleUpload()
        }}
      >
        <div className="receipt-upload-area">
          <CloudUpload size={42} aria-hidden="true" />

          <label htmlFor="receipt-file">Choose a receipt</label>

          <p>PDF, JPEG or PNG · Maximum 10 MB</p>

          <input
            ref={fileInputRef}
            id="receipt-file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={isUploading}
            onChange={(event) => handleFileSelection(event.target.files?.[0])}
          />
        </div>

        {file && (
          <div className="receipt-selected-file">
            <FileText size={24} aria-hidden="true" />

            <div className="receipt-selected-file-info">
              <span className="receipt-selected-file-name">{file.name}</span>

              <span className="receipt-selected-file-status">
                {isUploading ? 'Uploading...' : 'Ready to upload'}
              </span>
            </div>

            <button
              className="receipt-remove-file-button"
              type="button"
              aria-label="Remove selected file"
              title="Remove selected file"
              disabled={isUploading}
              onClick={handleRemoveFile}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {error && (
          <p className="receipt-modal-error" role="alert">
            {error}
          </p>
        )}

        <div className="receipt-modal-actions">
          <button
            className="receipts-secondary-button"
            type="button"
            disabled={isUploading}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="receipts-primary-button"
            type="submit"
            disabled={!file || !onUpload || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload receipt'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default UploadReceiptModal
