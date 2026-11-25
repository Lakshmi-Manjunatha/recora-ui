import { useEffect, useRef, useState } from 'react'
import { CloudUpload, FileText, X } from 'lucide-react'

import {
  ALLOWED_RECEIPT_FILE_TYPES,
  RECEIPT_UPLOAD_LIMITS,
  formatFileSize,
  getFileKey,
} from '../../types/receiptUpload'

import type { ReceiptUploadHandler } from '../../types/receiptUpload'

import './ReceiptModals.css'
import './UploadReceiptModal.css'

interface UploadReceiptModalProps {
  onClose: () => void
  onUpload?: ReceiptUploadHandler
}

const { MAX_FILES, MAX_FILE_SIZE, MAX_BATCH_SIZE } = RECEIPT_UPLOAD_LIMITS

function UploadReceiptModal({ onClose, onUpload }: UploadReceiptModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadInProgressRef = useRef(false)

  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [keepOriginalFiles, setKeepOriginalFiles] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const totalSize = files.reduce((total, file) => total + file.size, 0)

  const usagePercentage = Math.min((totalSize / MAX_BATCH_SIZE) * 100, 100)

  useEffect(() => {
    const dialog = dialogRef.current

    dialog?.showModal()

    return () => {
      dialog?.close()
    }
  }, [])

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles || uploadInProgressRef.current) {
      return
    }

    const updatedFiles = [...files]
    const validationErrors: string[] = []

    const existingKeys = new Set(updatedFiles.map(getFileKey))

    let updatedTotalSize = totalSize

    for (const file of Array.from(selectedFiles)) {
      const fileKey = getFileKey(file)

      if (!ALLOWED_RECEIPT_FILE_TYPES.includes(file.type)) {
        validationErrors.push(`${file.name}: Please select a PDF, JPEG or PNG file.`)
        continue
      }

      if (file.size === 0) {
        validationErrors.push(`${file.name}: The selected file is empty.`)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        validationErrors.push(`${file.name}: The file size must not exceed 4 MB.`)
        continue
      }

      if (existingKeys.has(fileKey)) {
        validationErrors.push(`${file.name}: This file has already been selected.`)
        continue
      }

      if (updatedFiles.length >= MAX_FILES) {
        validationErrors.push(`${file.name}: Maximum 10 files allowed per batch.`)
        continue
      }

      if (updatedTotalSize + file.size > MAX_BATCH_SIZE) {
        validationErrors.push(`${file.name}: Combined file size must not exceed 10 MB.`)
        continue
      }

      updatedFiles.push(file)
      existingKeys.add(fileKey)
      updatedTotalSize += file.size
    }

    setFiles(updatedFiles)
    setErrors(validationErrors)

    // Allows the user to select the same file again
    // after removing it from the selected files.
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (fileKey: string) => {
    if (uploadInProgressRef.current) {
      return
    }

    setFiles((currentFiles) => currentFiles.filter((file) => getFileKey(file) !== fileKey))

    setErrors([])
    fileInputRef.current?.focus()
  }

  const handleRemoveAll = () => {
    if (uploadInProgressRef.current) {
      return
    }

    setFiles([])
    setErrors([])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    fileInputRef.current?.focus()
  }

  const handleUpload = async () => {
    if (files.length === 0 || !onUpload || uploadInProgressRef.current) {
      return
    }

    uploadInProgressRef.current = true
    setIsUploading(true)
    setErrors([])

    try {
      await onUpload({
        files: [...files],
        keepOriginalFiles,
      })

      onClose()
    } catch {
      setErrors(['Unable to upload the receipts. Please try again.'])
    } finally {
      uploadInProgressRef.current = false
      setIsUploading(false)
    }
  }

  const getUploadButtonLabel = () => {
    if (isUploading) {
      return 'Uploading...'
    }

    if (files.length === 1) {
      return 'Upload 1 receipt'
    }

    if (files.length > 1) {
      return `Upload ${files.length} receipts`
    }

    return 'Upload receipts'
  }

  return (
    <dialog
      ref={dialogRef}
      className="receipt-modal receipt-upload-modal"
      aria-labelledby="upload-receipt-title"
      aria-describedby="upload-receipt-description"
      onCancel={(event) => {
        event.preventDefault()

        if (!uploadInProgressRef.current) {
          onClose()
        }
      }}
    >
      <div className="receipt-modal-header">
        <h2 id="upload-receipt-title">Upload receipts</h2>
      </div>

      <p id="upload-receipt-description" className="receipt-modal-description">
        Select one or more receipts to add to your collection.
      </p>

      <form
        aria-busy={isUploading}
        onSubmit={(event) => {
          event.preventDefault()
          void handleUpload()
        }}
      >
        <div className="receipt-upload-area">
          <CloudUpload size={42} aria-hidden="true" />

          <label htmlFor="receipt-file">Choose receipts</label>

          <p>PDF, JPEG or PNG</p>

          <p>Up to 10 files · Maximum 4 MB per file</p>

          <p>Maximum combined size: 10 MB</p>

          <input
            ref={fileInputRef}
            id="receipt-file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            disabled={isUploading}
            onChange={(event) => handleFileSelection(event.target.files)}
          />
        </div>

        <div className="receipt-upload-summary">
          <div className="receipt-upload-summary-text">
            <span role="status">
              {files.length} of {MAX_FILES} files selected
            </span>

            <span>{formatFileSize(totalSize)} / 10 MB</span>
          </div>

          <progress
            className="receipt-upload-capacity"
            aria-label="Selected file size"
            value={usagePercentage}
            max={100}
          />
        </div>

        {files.length > 0 && (
          <section className="receipt-selected-files" aria-label="Selected receipts">
            <div className="receipt-selected-files-header">
              <h3>Selected receipts</h3>

              <button
                type="button"
                className="receipt-remove-all-button"
                disabled={isUploading}
                onClick={handleRemoveAll}
              >
                Remove all
              </button>
            </div>

            <ul className="receipt-selected-files-list">
              {files.map((file) => (
                <li key={getFileKey(file)} className="receipt-selected-file">
                  <FileText size={24} aria-hidden="true" />

                  <div className="receipt-selected-file-info">
                    <span className="receipt-selected-file-name">{file.name}</span>

                    <span className="receipt-selected-file-status">
                      {formatFileSize(file.size)}
                      {' · '}
                      {isUploading ? 'Uploading...' : 'Ready to upload'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="receipt-remove-file-button"
                    aria-label={`Remove ${file.name}`}
                    title={`Remove ${file.name}`}
                    disabled={isUploading}
                    onClick={() => handleRemoveFile(getFileKey(file))}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {errors.length > 0 && (
          <div className="receipt-upload-errors" role="alert">
            <ul>
              {errors.map((error, index) => (
                <li key={`${index}-${error}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="receipt-storage-option">
          <label className="receipt-storage-label" htmlFor="keep-original-files">
            <input
              id="keep-original-files"
              type="checkbox"
              checked={keepOriginalFiles}
              disabled={isUploading}
              aria-describedby="receipt-storage-description"
              onChange={(event) => setKeepOriginalFiles(event.target.checked)}
            />

            <span>Keep original receipt files</span>
          </label>

          <p id="receipt-storage-description">
            {keepOriginalFiles
              ? 'Original receipts will be saved for future viewing and downloading.'
              : 'Only extracted receipt information will be saved. Original files cannot be retrieved later.'}
          </p>
        </div>

        <div className="receipt-modal-actions">
          <button
            type="button"
            className="receipts-secondary-button"
            disabled={isUploading}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="receipts-primary-button"
            disabled={files.length === 0 || !onUpload || isUploading}
          >
            {getUploadButtonLabel()}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default UploadReceiptModal
