import { render, screen } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import { describe, expect, it, vi } from 'vitest'

import type { Receipt } from '../../types/receipt'

import OriginalReceiptActions from './OriginalReceiptActions'

const receipt: Receipt = {
  id: 'receipt-001',
  merchant: 'Currys',
  purchaseDate: '2026-11-25',
  category: 'Electronics',
  totalAmount: 44900,
  currency: 'GBP',
  items: [],
  originalReceipt: {
    fileName: 'currys-tv.pdf',
    contentType: 'application/pdf',
    sizeInBytes: 580 * 1024,
  },
}

describe('OriginalReceiptActions', () => {
  it('displays original receipt information', () => {
    render(<OriginalReceiptActions receipt={receipt} />)

    expect(screen.getByText('currys-tv.pdf')).toBeInTheDocument()

    expect(screen.getByText('580 KB')).toBeInTheDocument()
  })

  it('displays a message when the original is unavailable', () => {
    render(
      <OriginalReceiptActions
        receipt={{
          ...receipt,
          originalReceipt: null,
        }}
      />,
    )

    expect(screen.getByText('Original receipt is not available.')).toBeInTheDocument()
  })

  it('does not display actions when no original exists', () => {
    render(
      <OriginalReceiptActions
        receipt={{
          ...receipt,
          originalReceipt: null,
        }}
      />,
    )

    expect(
      screen.queryByRole('button', {
        name: 'View original',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: 'Download',
      }),
    ).not.toBeInTheDocument()
  })

  it('disables actions without handlers', () => {
    render(<OriginalReceiptActions receipt={receipt} />)

    expect(
      screen.getByRole('button', {
        name: 'View original',
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: 'Download',
      }),
    ).toBeDisabled()
  })

  it('calls the view handler with the receipt ID', async () => {
    const user = userEvent.setup()
    const onViewOriginal = vi.fn()

    render(<OriginalReceiptActions receipt={receipt} onViewOriginal={onViewOriginal} />)

    await user.click(
      screen.getByRole('button', {
        name: 'View original',
      }),
    )

    expect(onViewOriginal).toHaveBeenCalledWith('receipt-001')
  })

  it('calls the download handler with the receipt ID', async () => {
    const user = userEvent.setup()
    const onDownloadOriginal = vi.fn()

    render(<OriginalReceiptActions receipt={receipt} onDownloadOriginal={onDownloadOriginal} />)

    await user.click(
      screen.getByRole('button', {
        name: 'Download',
      }),
    )

    expect(onDownloadOriginal).toHaveBeenCalledWith('receipt-001')
  })

  it('disables actions when explicitly disabled', () => {
    render(
      <OriginalReceiptActions
        receipt={receipt}
        onViewOriginal={vi.fn()}
        onDownloadOriginal={vi.fn()}
        disabled
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'View original',
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: 'Download',
      }),
    ).toBeDisabled()
  })
})
