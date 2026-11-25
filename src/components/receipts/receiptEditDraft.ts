import { RECEIPT_CATEGORIES } from '../../types/receipt'
import type { Receipt, ReceiptItem } from '../../types/receipt'

export interface ReceiptItemDraft {
  id: ReceiptItem['id']
  name: string
  quantity: string
  totalAmount: string
}

export function formatAmountInput(pence: number) {
  const absolutePence = Math.abs(pence)
  const pounds = Math.trunc(absolutePence / 100)
  const pennies = String(absolutePence % 100).padStart(2, '0')
  return `${pence < 0 ? '-' : ''}${pounds}.${pennies}`
}

export function createReceiptDraft(receipt: Receipt) {
  return {
    merchant: receipt.merchant,
    purchaseDate: receipt.purchaseDate,
    category: receipt.category,
    totalAmount: formatAmountInput(receipt.totalAmount),
    items: receipt.items.map((item): ReceiptItemDraft => ({
      id: item.id,
      name: item.name,
      quantity: String(item.quantity),
      totalAmount: formatAmountInput(item.totalAmount),
    })),
  }
}

type ReceiptDraft = ReturnType<typeof createReceiptDraft>

function parsePence(input: string) {
  const match = /^(-?)(?:(\d+)(?:\.(\d{0,2}))?|\.(\d{1,2}))$/.exec(input.trim())
  if (!match) return null

  const [, sign, pounds = '0', pennies, fractionalOnly] = match
  const pence = Number(`${sign}${pounds}${(pennies ?? fractionalOnly ?? '').padEnd(2, '0')}`)
  return Number.isSafeInteger(pence) ? pence || 0 : null
}

function isPurchaseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false

  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function validateReceiptDraft(draft: ReceiptDraft, receipt: Receipt) {
  const merchant = draft.merchant.trim()
  const totalAmount = parsePence(draft.totalAmount)
  const errors = {
    merchant: merchant ? undefined : 'Enter a merchant name.',
    purchaseDate: isPurchaseDate(draft.purchaseDate) ? undefined : 'Enter a valid purchase date.',
    category: RECEIPT_CATEGORIES.includes(draft.category)
      ? undefined
      : 'Choose a receipt category.',
    totalAmount:
      totalAmount === null ? 'Enter a GBP amount with up to two decimal places.' : undefined,
  }
  const items: ReceiptItem[] = []
  const itemErrors = draft.items.map((item) => {
    const name = item.name.trim()
    const quantityText = item.quantity.trim()
    const quantity = Number(quantityText)
    const validQuantity =
      /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(quantityText) && Number.isFinite(quantity) && quantity > 0
    const itemTotal = parsePence(item.totalAmount)

    if (name && validQuantity && itemTotal !== null) {
      items.push({ id: item.id, name, quantity, totalAmount: itemTotal })
    }

    return {
      name: name ? undefined : 'Enter a product name.',
      quantity: validQuantity ? undefined : 'Enter a quantity greater than zero.',
      totalAmount:
        itemTotal === null ? 'Enter a GBP amount with up to two decimal places.' : undefined,
    }
  })

  const updatedReceipt =
    totalAmount !== null &&
    !Object.values(errors).some(Boolean) &&
    items.length === draft.items.length
      ? {
          ...receipt,
          merchant,
          purchaseDate: draft.purchaseDate,
          category: draft.category,
          totalAmount,
          items,
        }
      : null

  return { errors, itemErrors, updatedReceipt }
}
