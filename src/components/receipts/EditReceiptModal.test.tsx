import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { testReceipts } from '../../test/fixtures/receipts_test'
import type { Receipt, ReceiptSaveHandler } from '../../types/receipt'
import EditReceiptModal from './EditReceiptModal'

const receipt: Receipt = {
  ...testReceipts[0],
  items: testReceipts[0].items.slice(0, 2),
  originalReceipt: { fileName: 'original.pdf', contentType: 'application/pdf', sizeInBytes: 4200 },
}

describe('EditReceiptModal', () => {
  it('prepopulates receipt information and line totals in pounds', () => {
    render(<EditReceiptModal receipt={receipt} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog', { name: 'Edit receipt' })

    expect(dialog).toHaveAccessibleDescription('Review and correct your receipt information.')
    const merchant = within(dialog).getByLabelText('Merchant name')
    expect(merchant).toHaveValue('Tesco')
    expect(merchant).toHaveFocus()
    expect(within(dialog).getByLabelText('Purchase date')).toHaveValue('2026-11-24')
    expect(within(dialog).getByLabelText('Receipt category')).toHaveValue('Groceries')
    expect(within(dialog).getByLabelText('Receipt total (£)')).toHaveValue('38.90')
    const firstItem = within(dialog).getByRole('group', { name: 'Item 1' })
    expect(within(firstItem).getByLabelText('Product name')).toHaveValue('Milk')
    expect(within(firstItem).getByLabelText('Quantity')).toHaveValue('2')
    expect(within(firstItem).getByLabelText('Item total (£)')).toHaveValue('3.20')
  })

  it('saves corrected information, preserves IDs and metadata, and supports adding and removing items', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn<ReceiptSaveHandler>()
    const onClose = vi.fn()
    render(<EditReceiptModal receipt={receipt} onClose={onClose} onSave={onSave} />)

    fireEvent.change(screen.getByLabelText('Merchant name'), {
      target: { value: '  Local Market ' },
    })
    fireEvent.change(screen.getByLabelText('Purchase date'), { target: { value: '2026-11-25' } })
    await user.selectOptions(screen.getByLabelText('Receipt category'), 'Household')
    fireEvent.change(screen.getByLabelText('Receipt total (£)'), { target: { value: '6.01' } })

    const firstItem = within(screen.getByRole('group', { name: 'Item 1' }))
    fireEvent.change(firstItem.getByLabelText('Product name'), {
      target: { value: '  Whole milk  ' },
    })
    fireEvent.change(firstItem.getByLabelText('Quantity'), { target: { value: '3' } })
    fireEvent.change(firstItem.getByLabelText('Item total (£)'), { target: { value: '4.31' } })
    await user.click(screen.getByRole('button', { name: 'Remove item 2' }))
    await user.click(screen.getByRole('button', { name: 'Add item' }))

    const addedItem = within(screen.getByRole('group', { name: 'Item 2' }))
    const addedName = addedItem.getByLabelText('Product name')
    expect(addedName).toHaveFocus()
    await user.type(addedName, 'Apples')
    fireEvent.change(addedItem.getByLabelText('Quantity'), { target: { value: '0.5' } })
    await user.type(addedItem.getByLabelText('Item total (£)'), '.50')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).toHaveBeenCalledExactlyOnceWith({
      ...receipt,
      merchant: 'Local Market',
      purchaseDate: '2026-11-25',
      category: 'Household',
      totalAmount: 601,
      items: [
        { id: receipt.items[0].id, name: 'Whole milk', quantity: 3, totalAmount: 431 },
        { id: expect.stringMatching(/^new-/), name: 'Apples', quantity: 0.5, totalAmount: 50 },
      ],
    })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(receipt.items).toEqual(testReceipts[0].items.slice(0, 2))
  })

  it('reports missing and invalid fields without submitting', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn<ReceiptSaveHandler>()
    render(<EditReceiptModal receipt={receipt} onClose={vi.fn()} onSave={onSave} />)
    const merchant = screen.getByLabelText('Merchant name')
    const date = screen.getByLabelText('Purchase date')
    const total = screen.getByLabelText('Receipt total (£)')
    const firstItem = within(screen.getByRole('group', { name: 'Item 1' }))
    const product = firstItem.getByLabelText('Product name')
    const quantity = firstItem.getByLabelText('Quantity')
    const lineTotal = firstItem.getByLabelText('Item total (£)')

    fireEvent.change(merchant, { target: { value: '  ' } })
    fireEvent.change(date, { target: { value: '' } })
    fireEvent.change(total, { target: { value: '1.234' } })
    fireEvent.change(product, { target: { value: '' } })
    fireEvent.change(quantity, { target: { value: '0' } })
    fireEvent.change(lineTotal, { target: { value: '999999999999999.99' } })
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Check the highlighted fields')
    expect(merchant).toHaveAccessibleDescription('Enter a merchant name.')
    expect(date).toHaveAccessibleDescription('Enter a valid purchase date.')
    expect(total).toHaveAccessibleDescription('Enter a GBP amount with up to two decimal places.')
    expect(product).toHaveAccessibleDescription('Enter a product name.')
    expect(quantity).toHaveAccessibleDescription('Enter a quantity greater than zero.')
    expect(lineTotal).toHaveAccessibleDescription(
      'Enter a GBP amount with up to two decimal places.',
    )
    fireEvent.change(quantity, { target: { value: '1' } })
    expect(quantity).not.toHaveAttribute('aria-invalid')
  })

  it('allows receipts with no line items and preserves signed amounts and zero exactly', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn<ReceiptSaveHandler>()
    const refund = { ...receipt, totalAmount: -101, items: [] }
    render(<EditReceiptModal receipt={refund} onClose={vi.fn()} onSave={onSave} />)

    expect(screen.getByText('No purchased items added.')).toBeInTheDocument()
    const total = screen.getByLabelText('Receipt total (£)')
    expect(total).toHaveValue('-1.01')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSave).toHaveBeenLastCalledWith(refund)
    fireEvent.change(total, { target: { value: '0' } })
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSave).toHaveBeenLastCalledWith({ ...refund, totalAmount: 0 })
  })

  it('keeps the draft on failure and closes after a successful retry', async () => {
    const user = userEvent.setup()
    const onSave = vi
      .fn<ReceiptSaveHandler>()
      .mockRejectedValueOnce(new Error('Internal details'))
      .mockResolvedValueOnce(undefined)
    const onClose = vi.fn()
    render(<EditReceiptModal receipt={receipt} onClose={onClose} onSave={onSave} />)
    const merchant = screen.getByLabelText('Merchant name')
    fireEvent.change(merchant, { target: { value: 'Market' } })
    const save = screen.getByRole('button', { name: 'Save changes' })

    await user.click(save)
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save changes.')
    expect(merchant).toHaveValue('Market')
    expect(onClose).not.toHaveBeenCalled()
    await user.click(save)

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(onSave).toHaveBeenCalledTimes(2)
    expect(onSave).toHaveBeenLastCalledWith({ ...receipt, merchant: 'Market' })
  })

  it('prevents repeat submissions and dismissal while saving', async () => {
    const user = userEvent.setup()
    let finishSave!: () => void
    const onSave = vi.fn<ReceiptSaveHandler>().mockReturnValue(
      new Promise<void>((resolve) => {
        finishSave = resolve
      }),
    )
    const onClose = vi.fn()
    render(<EditReceiptModal receipt={receipt} onClose={onClose} onSave={onSave} />)
    const dialog = screen.getByRole('dialog', { name: 'Edit receipt' })
    const save = within(dialog).getByRole('button', { name: 'Save changes' })

    await user.click(save)
    expect(within(dialog).getByRole('status')).toHaveTextContent('Saving changes')
    expect(save).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(within(dialog).getByLabelText('Merchant name')).toBeDisabled()
    fireEvent.submit(save.closest('form')!)
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()

    await act(() => finishSave())
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
