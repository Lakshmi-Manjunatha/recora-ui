export const RECEIPT_UPLOAD_LIMITS = {
  MAX_FILES: 10,
  MAX_FILE_SIZE: 4 * 1024 * 1024,
  MAX_BATCH_SIZE: 10 * 1024 * 1024,
} as const

export const ALLOWED_RECEIPT_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export interface ReceiptUploadRequest {
  files: File[]
  keepOriginalFiles: boolean
}

export type ReceiptUploadHandler = (request: ReceiptUploadRequest) => Promise<void>

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 KB'
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function getFileKey(file: File): string {
  return JSON.stringify([file.name, file.size, file.type, file.lastModified])
}
