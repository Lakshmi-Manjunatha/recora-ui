
export type ReceiptCategory =
    | 'Groceries'
    | 'Personal care'
    | 'Household'
    | 'Electronics'
    | 'Clothing'
    | 'Dining'
    | 'Other'

export interface ReceiptItem {
    id: string
    name: string
    quantity: number
    totalAmount: number
}

export interface Receipt {
    id: string
    merchant: string
    purchaseDate: string
    category: ReceiptCategory
    totalAmount: number
    currency: 'GBP'
    items: ReceiptItem[]
}

export const RECEIPT_CATEGORIES: ReceiptCategory[] = [
    'Groceries',
    'Personal care',
    'Household',
    'Electronics',
    'Clothing',
    'Dining',
    'Other',
]

export function formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(amount / 100)
}

export function formatReceiptDate(date: string): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(date))
}
