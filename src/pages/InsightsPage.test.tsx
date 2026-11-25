import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Receipt } from '../types/receipt'
import { testReceipts } from '../test/fixtures/receipts_test'
import InsightsPage from './InsightsPage'

const receipts: Receipt[] = [
  {
    ...testReceipts[0],
    id: 'june-groceries',
    purchaseDate: '2026-06-03',
    merchant: 'Market',
    totalAmount: 2010,
  },
  {
    ...testReceipts[0],
    id: 'march-groceries',
    purchaseDate: '2026-03-28',
    merchant: 'Market',
    totalAmount: 1020,
  },
  {
    ...testReceipts[0],
    id: 'december-groceries',
    purchaseDate: '2025-12-31',
    merchant: 'Food Shop',
    totalAmount: 1253,
  },
  {
    ...testReceipts[0],
    id: 'june-dining',
    purchaseDate: '2026-06-01',
    merchant: 'Cafe',
    category: 'Dining',
    totalAmount: 500,
  },
  {
    ...testReceipts[0],
    id: 'january-groceries',
    purchaseDate: '2026-01-01',
    merchant: 'Market',
    totalAmount: 0,
  },
]

function getSpendingSummary() {
  return within(screen.getByRole('region', { name: 'Spending summary' }))
}

function getBreakdownRows(title: string) {
  return within(screen.getByRole('region', { name: title })).getAllByRole('listitem')
}

function expectBreakdown(title: string, entries: [string, string][]) {
  const rows = getBreakdownRows(title)
  expect(rows).toHaveLength(entries.length)
  entries.forEach(([label, amount], index) => {
    expect(within(rows[index]).getByText(label)).toBeInTheDocument()
    expect(within(rows[index]).getByText(amount)).toBeInTheDocument()
  })
}

describe('InsightsPage', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 5, 15, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the heading, filters and summary in GBP with averages rounded to the penny', () => {
    render(<InsightsPage receipts={receipts} />)

    expect(screen.getByRole('heading', { name: 'Shopping insights' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Date range' })).toHaveValue('all')
    expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue('all')

    const summary = getSpendingSummary()
    expect(summary.getByText('Total spending')).toBeInTheDocument()
    expect(summary.getByText('£47.83')).toBeInTheDocument()
    expect(summary.getByText('Monthly spending')).toBeInTheDocument()
    expect(summary.getByText('£25.10')).toBeInTheDocument()
    expect(summary.getByText('Average receipt value')).toBeInTheDocument()
    expect(summary.getByText('£9.57')).toBeInTheDocument()
    expect(summary.getByText('Total receipts')).toBeInTheDocument()
    expect(summary.getByText('5')).toBeInTheDocument()
  })

  it('groups and ranks category and merchant spending using all matching receipts', () => {
    render(<InsightsPage receipts={receipts} />)

    expectBreakdown('Spending by category', [
      ['Groceries', '£42.83'],
      ['Dining', '£5.00'],
    ])
    expectBreakdown('Spending by merchant', [
      ['Market', '£30.30'],
      ['Food Shop', '£12.53'],
      ['Cafe', '£5.00'],
    ])
  })

  it('shows trends in chronological order with zero-filled months across the year boundary', () => {
    render(<InsightsPage receipts={receipts} />)

    expectBreakdown('Monthly spending trends', [
      ['Dec 2025', '£12.53'],
      ['Jan 2026', '£0.00'],
      ['Feb 2026', '£0.00'],
      ['Mar 2026', '£10.20'],
      ['Apr 2026', '£0.00'],
      ['May 2026', '£0.00'],
      ['Jun 2026', '£25.10'],
    ])
  })

  it('applies the date and category filters together across the summary and all breakdowns', async () => {
    const user = userEvent.setup()
    render(<InsightsPage receipts={receipts} />)
    const period = screen.getByRole('combobox', { name: 'Date range' })
    const category = screen.getByRole('combobox', { name: 'Category' })

    await user.selectOptions(period, 'last-six-months')
    await user.selectOptions(category, 'Groceries')

    expect(getSpendingSummary().getByText('£30.30')).toBeInTheDocument()
    expect(getSpendingSummary().getByText('3')).toBeInTheDocument()
    expectBreakdown('Spending by category', [['Groceries', '£30.30']])
    expectBreakdown('Spending by merchant', [['Market', '£30.30']])
    expectBreakdown('Monthly spending trends', [
      ['Jan 2026', '£0.00'],
      ['Feb 2026', '£0.00'],
      ['Mar 2026', '£10.20'],
      ['Apr 2026', '£0.00'],
      ['May 2026', '£0.00'],
      ['Jun 2026', '£20.10'],
    ])

    await user.selectOptions(period, 'this-month')

    expect(getSpendingSummary().getByText('1')).toBeInTheDocument()
    expectBreakdown('Monthly spending trends', [['Jun 2026', '£20.10']])

    await user.selectOptions(category, 'Clothing')

    expect(screen.getByRole('status')).toHaveTextContent('No receipts match these filters.')
    expect(getSpendingSummary().getAllByText('—')).toHaveLength(4)

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(period).toHaveValue('all')
    expect(category).toHaveValue('all')
    expect(getSpendingSummary().getByText('£47.83')).toBeInTheDocument()
  })

  it('shows unavailable totals and empty sections when no data is supplied', () => {
    render(<InsightsPage />)

    expect(getSpendingSummary().getAllByText('—')).toHaveLength(4)
    expect(screen.getByRole('status')).toHaveTextContent('Add receipts to see your spending.')
    expect(screen.getByText('No category spending to display.')).toBeInTheDocument()
    expect(screen.getByText('No monthly spending to display.')).toBeInTheDocument()
    expect(screen.getByText('No merchant spending to display.')).toBeInTheDocument()
    expect(screen.getByText('No product nutrition data available yet.')).toBeInTheDocument()
    expect(screen.getByText('No retailer prices available yet.')).toBeInTheDocument()
    expect(screen.queryByText('£38.90')).not.toBeInTheDocument()
    expect(screen.queryByText('Crunchy Breakfast Cereal')).not.toBeInTheDocument()
    expect(screen.queryByText(/Brand X/)).not.toBeInTheDocument()
  })

  it('shows real zero spending separately from an empty dataset', () => {
    render(<InsightsPage receipts={[receipts[4]]} />)

    expect(getSpendingSummary().getAllByText('£0.00')).toHaveLength(3)
    expect(getSpendingSummary().getByText('1')).toBeInTheDocument()
    expectBreakdown('Spending by category', [['Groceries', '£0.00']])
    expectBreakdown('Spending by merchant', [['Market', '£0.00']])
    expectBreakdown('Monthly spending trends', [['Jan 2026', '£0.00']])
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('announces loading and hides summaries until receipts are ready', () => {
    const { rerender } = render(<InsightsPage receipts={receipts} isLoading />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading insights')
    expect(screen.queryByRole('region', { name: 'Spending summary' })).not.toBeInTheDocument()

    rerender(<InsightsPage receipts={receipts} />)

    expect(getSpendingSummary().getByText('£47.83')).toBeInTheDocument()
  })

  it('rounds a sub-penny refund average to zero without a negative sign', () => {
    const refund = { ...receipts[0], totalAmount: -1 }
    const freeReceipt = receipts[4]
    render(
      <InsightsPage
        receipts={[refund, freeReceipt, { ...freeReceipt, id: 'another-free-receipt' }]}
      />,
    )

    const summary = getSpendingSummary()
    expect(summary.getAllByText('-£0.01')).toHaveLength(2)
    expect(summary.getByText('£0.00')).toBeInTheDocument()
  })

  it('announces an error without displaying stale spending', () => {
    render(<InsightsPage receipts={receipts} error="Could not load insights. Try again later." />)

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load insights. Try again later.')
    expect(screen.queryByRole('region', { name: 'Spending summary' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Monthly spending trends' }),
    ).not.toBeInTheDocument()
  })

  it('shows supplied product nutrition, ingredients, and retailer prices', async () => {
    const user = userEvent.setup()
    render(
      <InsightsPage
        products={[
          {
            id: 'oats',
            name: 'Rolled Oats',
            nutrients: [{ name: 'Fat', grams: 7 }],
            ingredients: 'Wholegrain oats.',
          },
        ]}
        priceComparisons={[
          {
            id: 'oats-500g',
            productName: 'Rolled Oats, 500 g',
            offers: [{ retailer: 'Test Retailer', amount: 240 }],
          },
        ]}
      />,
    )

    expect(screen.getByText('7 g')).toBeInTheDocument()
    expect(screen.getByText('Test Retailer')).toBeInTheDocument()
    expect(screen.getByText('£2.40')).toBeInTheDocument()

    const ingredients = screen.getByLabelText('View ingredients for Rolled Oats')
    await user.click(ingredients)

    expect(ingredients.closest('details')).toHaveAttribute('open')
    expect(screen.getByText('Wholegrain oats.')).toBeInTheDocument()
  })
})
