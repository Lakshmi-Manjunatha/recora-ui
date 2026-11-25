import { useEffect, useId, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import { Plus, X } from 'lucide-react'
import { RECEIPT_CATEGORIES } from '../../types/receipt'
import type { Receipt, ReceiptSaveHandler } from '../../types/receipt'
import { createReceiptDraft, validateReceiptDraft } from './receiptEditDraft'
import type { ReceiptItemDraft } from './receiptEditDraft'
import './ReceiptModals.css'
import './EditReceiptModal.css'

interface EditReceiptModalProps {
  receipt: Receipt
  onClose: () => void
  onSave?: ReceiptSaveHandler
}

interface EditFieldProps extends Pick<ComponentProps<'input'>, 'type' | 'inputMode' | 'name'> {
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}

function EditField({ label, value, error, onChange, ...inputProps }: EditFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="receipt-edit-field">
      <label htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        value={value}
        required
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span id={errorId}>{error}</span>}
    </div>
  )
}

function EditReceiptModal({ receipt, onClose, onSave }: EditReceiptModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const addItemRef = useRef<HTMLButtonElement>(null)
  const savingRef = useRef(false)
  const nextItemToFocus = useRef<string | null>(null)
  const [draft, setDraft] = useState(() => createReceiptDraft(receipt))
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { errors, itemErrors, updatedReceipt } = validateReceiptDraft(draft, receipt)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    dialog?.querySelector<HTMLInputElement>('[name="receipt-merchant"]')?.focus()

    return () => {
      dialog?.close()
    }
  }, [])

  useEffect(() => {
    if (nextItemToFocus.current) {
      const name = `product-${nextItemToFocus.current}`
      dialogRef.current?.querySelector<HTMLInputElement>(`[name="${name}"]`)?.focus()
      nextItemToFocus.current = null
    }
  }, [draft.items])

  function updateItem(id: string, field: Exclude<keyof ReceiptItemDraft, 'id'>, value: string) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  function addItem() {
    const id = `new-${crypto.randomUUID()}`
    nextItemToFocus.current = id
    setDraft((current) => ({
      ...current,
      items: [...current.items, { id, name: '', quantity: '1', totalAmount: '' }],
    }))
  }

  function removeItem(id: string) {
    setDraft((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }))
    addItemRef.current?.focus()
  }

  function closeEditor() {
    if (!savingRef.current) onClose()
  }

  async function saveReceipt() {
    if (!onSave || savingRef.current) return

    setHasSubmitted(true)
    setSaveError(null)
    if (!updatedReceipt) return

    savingRef.current = true
    setIsSaving(true)
    try {
      await onSave(updatedReceipt)
      if (dialogRef.current?.open) onClose()
    } catch {
      setSaveError('Unable to save changes. Please try again.')
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="receipt-modal receipt-edit-modal"
      aria-labelledby="edit-receipt-title"
      aria-describedby="edit-receipt-description"
      onCancel={(event) => {
        event.preventDefault()
        closeEditor()
      }}
    >
      <div className="receipt-modal-header">
        <h2 id="edit-receipt-title">Edit receipt</h2>
        <button
          className="receipt-modal-close"
          type="button"
          aria-label="Close edit receipt"
          disabled={isSaving}
          onClick={closeEditor}
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>
      <p id="edit-receipt-description">Review and correct your receipt information.</p>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void saveReceipt()
        }}
      >
        <fieldset disabled={isSaving} className="receipt-edit-section">
          <legend>Receipt information</legend>
          <div className="receipt-edit-information">
            <EditField
              label="Merchant name"
              name="receipt-merchant"
              value={draft.merchant}
              error={hasSubmitted ? errors.merchant : undefined}
              onChange={(merchant) => setDraft((current) => ({ ...current, merchant }))}
            />
            <EditField
              label="Purchase date"
              type="date"
              value={draft.purchaseDate}
              error={hasSubmitted ? errors.purchaseDate : undefined}
              onChange={(purchaseDate) => setDraft((current) => ({ ...current, purchaseDate }))}
            />
            <div className="receipt-edit-field">
              <label htmlFor="edit-receipt-category">Receipt category</label>
              <select
                id="edit-receipt-category"
                value={draft.category}
                required
                aria-invalid={Boolean(hasSubmitted && errors.category) || undefined}
                aria-describedby={
                  hasSubmitted && errors.category ? 'edit-receipt-category-error' : undefined
                }
                onChange={(event) => {
                  const category = RECEIPT_CATEGORIES.find((value) => value === event.target.value)
                  if (category) setDraft((current) => ({ ...current, category }))
                }}
              >
                {RECEIPT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {hasSubmitted && errors.category && (
                <span id="edit-receipt-category-error">{errors.category}</span>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset disabled={isSaving} className="receipt-edit-section">
          <legend>Purchased items</legend>
          {draft.items.length === 0 && <p>No purchased items added.</p>}
          {draft.items.map((item, index) => {
            const itemError = hasSubmitted ? itemErrors[index] : undefined

            return (
              <fieldset key={item.id} className="receipt-edit-item">
                <legend>Item {index + 1}</legend>
                <div className="receipt-edit-item-fields">
                  <EditField
                    label="Product name"
                    name={`product-${item.id}`}
                    value={item.name}
                    error={itemError?.name}
                    onChange={(name) => updateItem(item.id, 'name', name)}
                  />
                  <EditField
                    label="Quantity"
                    inputMode="decimal"
                    value={item.quantity}
                    error={itemError?.quantity}
                    onChange={(quantity) => updateItem(item.id, 'quantity', quantity)}
                  />
                  <EditField
                    label="Item total (£)"
                    inputMode="decimal"
                    value={item.totalAmount}
                    error={itemError?.totalAmount}
                    onChange={(amount) => updateItem(item.id, 'totalAmount', amount)}
                  />
                  <button
                    className="receipts-secondary-button"
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </fieldset>
            )
          })}
          <button
            ref={addItemRef}
            className="receipts-secondary-button"
            type="button"
            onClick={addItem}
          >
            <Plus size={16} aria-hidden="true" />
            Add item
          </button>
        </fieldset>

        <fieldset disabled={isSaving} className="receipt-edit-section">
          <legend>Receipt total</legend>
          <EditField
            label="Receipt total (£)"
            inputMode="decimal"
            value={draft.totalAmount}
            error={hasSubmitted ? errors.totalAmount : undefined}
            onChange={(totalAmount) => setDraft((current) => ({ ...current, totalAmount }))}
          />
          <p>Enter the final amount from the receipt, including any discounts or adjustments.</p>
        </fieldset>

        {!onSave && <p role="status">Saving receipt changes is currently unavailable.</p>}
        {hasSubmitted && !updatedReceipt && (
          <p className="receipt-modal-error" role="alert">
            Check the highlighted fields to save your changes.
          </p>
        )}
        {saveError && (
          <p className="receipt-modal-error" role="alert">
            {saveError}
          </p>
        )}
        {isSaving && <p role="status">Saving changes…</p>}
        <div className="receipt-modal-actions">
          <button
            className="receipts-secondary-button"
            type="button"
            disabled={isSaving}
            onClick={closeEditor}
          >
            Cancel
          </button>
          <button className="receipts-primary-button" type="submit" disabled={!onSave || isSaving}>
            Save changes
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default EditReceiptModal
