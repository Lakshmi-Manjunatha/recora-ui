import type { Receipt, ReceiptCategory } from '../types/receipt'

export type InsightsPeriod = 'all' | 'this-month' | 'last-six-months'
export type InsightsCategory = 'all' | ReceiptCategory

interface SpendingEntry {
  label: string
  amount: number
}

const monthLabel = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function getPurchaseMonth(purchaseDate: Receipt['purchaseDate']) {
  return Number(purchaseDate.slice(0, 4)) * 12 + Number(purchaseDate.slice(5, 7)) - 1
}

function formatMonth(month: number) {
  const date = new Date(0)
  date.setUTCFullYear(Math.floor(month / 12), month % 12, 1)
  return monthLabel.format(date)
}

function addSpending<Key>(totals: Map<Key, number>, key: Key, amount: number) {
  totals.set(key, (totals.get(key) ?? 0) + amount)
}

function rankSpending(totals: Map<string, number>): SpendingEntry[] {
  return Array.from(totals, ([label, amount]) => ({ label, amount })).sort(
    (first, second) => second.amount - first.amount || first.label.localeCompare(second.label),
  )
}

export function getReceiptInsights(
  receipts: readonly Receipt[],
  period: InsightsPeriod,
  category: InsightsCategory,
  now = new Date(),
) {
  const currentMonth = now.getFullYear() * 12 + now.getMonth()
  const periodStart = period === 'this-month' ? currentMonth : currentMonth - 5
  const categoryTotals = new Map<string, number>()
  const merchantTotals = new Map<string, number>()
  const monthTotals = new Map<number, number>()
  let totalSpending = 0
  let receiptCount = 0
  let firstMonth = Infinity
  let lastMonth = -Infinity

  for (const receipt of receipts) {
    const month = getPurchaseMonth(receipt.purchaseDate)
    if (
      (category !== 'all' && receipt.category !== category) ||
      (period !== 'all' && (month < periodStart || month > currentMonth))
    ) {
      continue
    }

    totalSpending += receipt.totalAmount
    receiptCount += 1
    firstMonth = Math.min(firstMonth, month)
    lastMonth = Math.max(lastMonth, month)
    addSpending(categoryTotals, receipt.category, receipt.totalAmount)
    addSpending(merchantTotals, receipt.merchant, receipt.totalAmount)
    addSpending(monthTotals, month, receipt.totalAmount)
  }

  const monthlyTrend: SpendingEntry[] = []
  if (receiptCount > 0) {
    const start = period === 'all' ? firstMonth : periodStart
    const end = period === 'all' ? lastMonth : currentMonth

    for (let month = start; month <= end; month += 1) {
      monthlyTrend.push({ label: formatMonth(month), amount: monthTotals.get(month) ?? 0 })
    }
  }

  const averagePence = Math.round(Math.abs(totalSpending) / Math.max(receiptCount, 1))

  return {
    receiptCount,
    totalSpending,
    monthlySpending: monthTotals.get(currentMonth) ?? 0,
    averageReceiptValue: totalSpending < 0 && averagePence > 0 ? -averagePence : averagePence,
    categorySpending: rankSpending(categoryTotals),
    merchantSpending: rankSpending(merchantTotals),
    monthlyTrend,
  }
}
