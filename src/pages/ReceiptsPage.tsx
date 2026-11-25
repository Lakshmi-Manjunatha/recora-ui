import { useState } from 'react'
import { CalendarDays, ChevronRight, ReceiptText, Search, Upload, Wallet } from 'lucide-react'

import { formatAmount, formatReceiptDate, RECEIPT_CATEGORIES } from '../types/receipt'

import type { Receipt, ReceiptSaveHandler } from '../types/receipt'
import EditReceiptModal from '../components/receipts/EditReceiptModal'
import ReceiptDetailsModal from '../components/receipts/ReceiptDetailsModal'
import UploadReceiptModal from '../components/receipts/UploadReceiptModal'
import type { ReceiptUploadHandler } from '../types/receiptUpload'
import './ReceiptsPage.css'

interface ReceiptsPageProps {
  receipts?: Receipt[]
  isLoading?: boolean
  error?: string | null
  onUpload?: ReceiptUploadHandler
  onEdit?: ReceiptSaveHandler
  onDelete?: (receipt: Receipt) => Promise<void>
  onViewOriginal?: (receiptId: string) => void
  onDownloadOriginal?: (receiptId: string) => void
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest'

function ReceiptsPage({
  receipts = [],
  isLoading = false,
  error = null,
  onUpload,
  onEdit,
  onDelete,
  onViewOriginal,
  onDownloadOriginal,
}: ReceiptsPageProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null)
  const [isEditingReceipt, setIsEditingReceipt] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const now = new Date()

  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const totalSpending = receipts.reduce((total, receipt) => total + receipt.totalAmount, 0)

  const monthlySpending = receipts
    .filter((receipt) => receipt.purchaseDate.startsWith(currentMonth))
    .reduce((total, receipt) => total + receipt.totalAmount, 0)

  const selectedReceipt = receipts.find((receipt) => receipt.id === selectedReceiptId)

  const searchTerm = search.trim().toLowerCase()

  const filteredReceipts = receipts
    .filter((receipt) => {
      const matchesSearch =
        receipt.merchant.toLowerCase().includes(searchTerm) ||
        receipt.category.toLowerCase().includes(searchTerm)

      const matchesCategory = category === 'all' || receipt.category === category

      const matchesDate = dateFilter === 'all' || receipt.purchaseDate.startsWith(currentMonth)

      return matchesSearch && matchesCategory && matchesDate
    })
    .sort((first, second) => {
      switch (sortBy) {
        case 'oldest':
          return first.purchaseDate.localeCompare(second.purchaseDate)
        case 'highest':
          return second.totalAmount - first.totalAmount
        case 'lowest':
          return first.totalAmount - second.totalAmount
        default:
          return second.purchaseDate.localeCompare(first.purchaseDate)
      }
    })

  const summaryCards = [
    {
      label: 'Total receipts',
      value: receipts.length.toString(),
      icon: ReceiptText,
    },
    {
      label: 'Total spending',
      value: formatAmount(totalSpending),
      icon: Wallet,
    },
    {
      label: 'This month',
      value: formatAmount(monthlySpending),
      icon: CalendarDays,
    },
  ]

  const resetFilters = () => {
    setSearch('')
    setCategory('all')
    setDateFilter('all')
    setSortBy('newest')
  }

  return (
    <section className="receipts-page" aria-labelledby="receipts-page-title">
      <div className="receipts-page-heading">
        <div>
          <h1 id="receipts-page-title">Your receipts</h1>
          <p>Organise and manage your everyday purchases.</p>
        </div>

        <button
          className="receipts-primary-button"
          type="button"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={18} aria-hidden="true" />
          Upload receipts
        </button>
      </div>

      {isLoading ? (
        <div className="receipts-state" role="status">
          Loading receipts...
        </div>
      ) : error ? (
        <div className="receipts-state" role="alert">
          {error}
        </div>
      ) : (
        <>
          <section className="receipts-summary" aria-label="Receipt summary">
            {summaryCards.map(({ label, value, icon: Icon }) => (
              <article className="receipts-summary-card" key={label}>
                <span className="receipts-icon">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <p>{label}</p>
                <strong>{value}</strong>
              </article>
            ))}
          </section>

          <div className="receipts-toolbar">
            <div className="receipts-search">
              <Search size={18} aria-hidden="true" />

              <input
                type="search"
                aria-label="Search receipts"
                placeholder="Search receipts..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All categories</option>

              {RECEIPT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option value="all">All dates</option>
              <option value="month">This month</option>
            </select>

            <select
              aria-label="Sort receipts"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
            </select>
          </div>

          {filteredReceipts.length === 0 ? (
            <div className="receipts-state">
              <ReceiptText size={42} aria-hidden="true" />

              <h2>{receipts.length === 0 ? 'No receipts yet' : 'No matching receipts'}</h2>

              <p>
                {receipts.length === 0
                  ? 'Upload your first receipt to get started.'
                  : 'Try changing your search or filters.'}
              </p>

              {receipts.length === 0 ? (
                <button
                  className="receipts-primary-button"
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload your first receipt
                </button>
              ) : (
                <button className="receipts-secondary-button" type="button" onClick={resetFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="receipts-table-container">
              <table className="receipts-table">
                <caption className="receipts-visually-hidden">Saved receipts</caption>

                <thead>
                  <tr>
                    <th scope="col">Merchant</th>
                    <th scope="col">Purchase date</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td>
                        <div className="receipts-merchant">
                          <span className="receipts-icon">
                            <ReceiptText size={21} aria-hidden="true" />
                          </span>

                          <div>
                            <strong>{receipt.merchant}</strong>
                            <span className="receipts-category">{receipt.category}</span>
                          </div>
                        </div>
                      </td>

                      <td>{formatReceiptDate(receipt.purchaseDate)}</td>

                      <td className="receipts-amount">{formatAmount(receipt.totalAmount)}</td>

                      <td>
                        <button
                          className="receipts-view-button"
                          type="button"
                          aria-label={`View receipt from ${receipt.merchant}`}
                          onClick={() => setSelectedReceiptId(receipt.id)}
                        >
                          <ChevronRight size={21} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="receipts-result-count" role="status">
            Showing {filteredReceipts.length} of {receipts.length} receipts
          </p>
        </>
      )}

      {selectedReceipt && isEditingReceipt && (
        <EditReceiptModal
          key={selectedReceipt.id}
          receipt={selectedReceipt}
          onClose={() => setIsEditingReceipt(false)}
          onSave={onEdit}
        />
      )}

      {selectedReceipt && !isEditingReceipt && (
        <ReceiptDetailsModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceiptId(null)}
          onEdit={() => setIsEditingReceipt(true)}
          onDelete={onDelete}
          onViewOriginal={onViewOriginal}
          onDownloadOriginal={onDownloadOriginal}
        />
      )}

      {showUploadModal && (
        <UploadReceiptModal onClose={() => setShowUploadModal(false)} onUpload={onUpload} />
      )}
    </section>
  )
}

export default ReceiptsPage
