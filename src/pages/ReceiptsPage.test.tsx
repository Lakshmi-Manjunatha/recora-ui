import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ReceiptsPage from './ReceiptsPage'
import { testReceipts } from '../test/fixtures/receipts_test'

describe('ReceiptsPage', () => {
  const openUploadModal = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(
      screen.getByRole('button', {
        name: 'Upload receipt',
      }),
    )

    return screen.getByRole('dialog', {
      name: 'Upload receipt',
    })
  }

  const openReceiptDetails = async (
    user: ReturnType<typeof userEvent.setup>,
    merchant = 'Tesco',
  ) => {
    await user.click(
      screen.getByRole('button', {
        name: `View receipt from ${merchant}`,
      }),
    )

    return screen.getByRole('dialog', {
      name: 'Receipt details',
    })
  }

  // Page rendering

  it('renders the receipts page heading', () => {
    render(<ReceiptsPage receipts={testReceipts} />)

    expect(
      screen.getByRole('heading', {
        name: 'Your receipts',
      }),
    ).toBeInTheDocument()
  })

  it('renders the upload receipt button', () => {
    render(<ReceiptsPage receipts={testReceipts} />)

    expect(
      screen.getByRole('button', {
        name: 'Upload receipt',
      }),
    ).toBeEnabled()
  })

  it('displays all saved receipts', () => {
    render(<ReceiptsPage receipts={testReceipts} />)

    expect(screen.getByText('Tesco')).toBeInTheDocument()
    expect(screen.getByText('Sainsbury’s')).toBeInTheDocument()
    expect(screen.getByText('Boots')).toBeInTheDocument()
  })

  // Receipt summary

  it('displays the total number of receipts', () => {
    render(<ReceiptsPage receipts={testReceipts} />)

    const summary = screen.getByRole('region', {
      name: 'Receipt summary',
    })

    expect(within(summary).getByText('Total receipts')).toBeInTheDocument()

    expect(within(summary).getByText('3', { exact: true })).toBeInTheDocument()
  })

  it('displays the total receipt spending', () => {
    render(<ReceiptsPage receipts={testReceipts} />)

    const summary = screen.getByRole('region', {
      name: 'Receipt summary',
    })

    expect(within(summary).getByText('Total spending')).toBeInTheDocument()

    expect(within(summary).getAllByText('£86.40').length).toBeGreaterThan(0)
  })

  it('displays spending for the current month', () => {
    const now = new Date()

    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const receipts = [
      {
        ...testReceipts[0],
        purchaseDate: `${currentMonth}-01`,
        totalAmount: 2500,
      },
      {
        ...testReceipts[1],
        purchaseDate: '2000-01-01',
        totalAmount: 1000,
      },
    ]

    render(<ReceiptsPage receipts={receipts} />)

    const summary = screen.getByRole('region', {
      name: 'Receipt summary',
    })

    expect(within(summary).getByText('This month')).toBeInTheDocument()

    expect(within(summary).getByText('£25.00')).toBeInTheDocument()
  })

  it('displays the receipt result count', () => {
    render(<ReceiptsPage receipts={testReceipts} />)

    expect(screen.getByText('Showing 3 of 3 receipts')).toBeInTheDocument()
  })

  // Empty, loading and error states

  it('displays the empty state when there are no receipts', () => {
    render(<ReceiptsPage receipts={[]} />)

    expect(screen.getByText('No receipts yet')).toBeInTheDocument()

    expect(screen.getByText('Upload your first receipt to get started.')).toBeInTheDocument()
  })

  it('opens the upload modal from the empty state', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={[]} />)

    await user.click(
      screen.getByRole('button', {
        name: 'Upload your first receipt',
      }),
    )

    expect(
      screen.getByRole('dialog', {
        name: 'Upload receipt',
      }),
    ).toBeInTheDocument()
  })

  it('displays the loading state', () => {
    render(<ReceiptsPage isLoading />)

    expect(screen.getByText('Loading receipts...')).toBeInTheDocument()
  })

  it('displays an error message', () => {
    render(<ReceiptsPage error="Unable to retrieve receipts." />)

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to retrieve receipts.')
  })

  // Receipt search

  it('searches receipts by merchant name', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Search receipts',
      }),
      'Tesco',
    )

    expect(screen.getByText('Tesco')).toBeInTheDocument()

    expect(screen.queryByText('Boots')).not.toBeInTheDocument()

    expect(screen.queryByText('Sainsbury’s')).not.toBeInTheDocument()
  })

  it('performs a case-insensitive search', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Search receipts',
      }),
      'tEsCo',
    )

    expect(screen.getByText('Tesco')).toBeInTheDocument()

    expect(screen.queryByText('Boots')).not.toBeInTheDocument()
  })

  it('searches receipts by category', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Search receipts',
      }),
      'Personal care',
    )

    expect(screen.getByText('Boots')).toBeInTheDocument()

    expect(screen.queryByText('Tesco')).not.toBeInTheDocument()
  })

  it('ignores leading and trailing search whitespace', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Search receipts',
      }),
      '  Tesco  ',
    )

    expect(screen.getByText('Tesco')).toBeInTheDocument()

    expect(screen.queryByText('Boots')).not.toBeInTheDocument()
  })

  // Receipt filtering

  it('filters receipts by category', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.selectOptions(screen.getByLabelText('Filter by category'), 'Groceries')

    expect(screen.getByText('Tesco')).toBeInTheDocument()

    expect(screen.getByText('Sainsbury’s')).toBeInTheDocument()

    expect(screen.queryByText('Boots')).not.toBeInTheDocument()
  })

  it('filters receipts by the current month', async () => {
    const user = userEvent.setup()
    const now = new Date()

    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const receipts = [
      {
        ...testReceipts[0],
        purchaseDate: `${currentMonth}-01`,
      },
      {
        ...testReceipts[1],
        purchaseDate: '2000-01-01',
      },
    ]

    render(<ReceiptsPage receipts={receipts} />)

    await user.selectOptions(screen.getByLabelText('Filter by date'), 'month')

    expect(screen.getByText('Tesco')).toBeInTheDocument()

    expect(screen.queryByText('Sainsbury’s')).not.toBeInTheDocument()
  })

  it('updates the result count after filtering', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.selectOptions(screen.getByLabelText('Filter by category'), 'Groceries')

    expect(screen.getByText('Showing 2 of 3 receipts')).toBeInTheDocument()
  })

  it('displays no matching receipts when search has no results', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Search receipts',
      }),
      'Unknown merchant',
    )

    expect(screen.getByText('No matching receipts')).toBeInTheDocument()

    expect(screen.getByText('Try changing your search or filters.')).toBeInTheDocument()
  })

  it('clears search and filters', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search receipts',
    })

    await user.selectOptions(screen.getByLabelText('Filter by category'), 'Groceries')

    await user.type(searchInput, 'Unknown merchant')

    await user.click(
      screen.getByRole('button', {
        name: 'Clear filters',
      }),
    )

    expect(searchInput).toHaveValue('')

    expect(screen.getByLabelText('Filter by category')).toHaveValue('all')

    expect(screen.getByLabelText('Filter by date')).toHaveValue('all')

    expect(screen.getByLabelText('Sort receipts')).toHaveValue('newest')

    expect(screen.getByText('Tesco')).toBeInTheDocument()
    expect(screen.getByText('Boots')).toBeInTheDocument()

    expect(screen.getByText('Sainsbury’s')).toBeInTheDocument()
  })

  // Receipt sorting

  it('sorts receipts by lowest amount', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.selectOptions(screen.getByLabelText('Sort receipts'), 'lowest')

    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')

    expect(rows[1]).toHaveTextContent('Boots')
    expect(rows[2]).toHaveTextContent('Sainsbury’s')
    expect(rows[3]).toHaveTextContent('Tesco')
  })

  it('sorts receipts by highest amount', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.selectOptions(screen.getByLabelText('Sort receipts'), 'highest')

    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')

    expect(rows[1]).toHaveTextContent('Tesco')
    expect(rows[2]).toHaveTextContent('Sainsbury’s')
    expect(rows[3]).toHaveTextContent('Boots')
  })

  it('sorts receipts by oldest purchase date', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    await user.selectOptions(screen.getByLabelText('Sort receipts'), 'oldest')

    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')

    expect(rows[1]).toHaveTextContent('Boots')
    expect(rows[2]).toHaveTextContent('Sainsbury’s')
    expect(rows[3]).toHaveTextContent('Tesco')
  })

  it('sorts receipts by newest purchase date', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const sortInput = screen.getByLabelText('Sort receipts')

    await user.selectOptions(sortInput, 'oldest')
    await user.selectOptions(sortInput, 'newest')

    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row')

    expect(rows[1]).toHaveTextContent('Tesco')
    expect(rows[2]).toHaveTextContent('Sainsbury’s')
    expect(rows[3]).toHaveTextContent('Boots')
  })

  // Receipt details modal

  it('opens the receipt details modal', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openReceiptDetails(user)

    expect(dialog).toBeInTheDocument()

    expect(within(dialog).getByText('Tesco')).toBeInTheDocument()

    expect(within(dialog).getByText('Purchased items')).toBeInTheDocument()

    expect(within(dialog).getByText('Total amount')).toBeInTheDocument()
  })

  it('displays the purchased items in the receipt', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openReceiptDetails(user)

    expect(within(dialog).getByText(/Milk/)).toBeInTheDocument()

    expect(within(dialog).getByText(/Bread/)).toBeInTheDocument()

    expect(within(dialog).getByText(/Fruit and vegetables/)).toBeInTheDocument()
  })

  it('closes the receipt details modal', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openReceiptDetails(user)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Close receipt details',
      }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // Edit receipt

  it('disables edit when no edit handler is provided', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openReceiptDetails(user)

    expect(
      within(dialog).getByRole('button', {
        name: 'Edit receipt',
      }),
    ).toBeDisabled()
  })

  it('calls the edit handler with the selected receipt', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(<ReceiptsPage receipts={testReceipts} onEdit={onEdit} />)

    const dialog = await openReceiptDetails(user)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Edit receipt',
      }),
    )

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(testReceipts[0])

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // Delete receipt

  it('disables delete when no delete handler is provided', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openReceiptDetails(user)

    expect(
      within(dialog).getByRole('button', {
        name: 'Delete receipt',
      }),
    ).toBeDisabled()
  })

  it('requests confirmation before deleting a receipt', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onDelete={onDelete} />)

    const dialog = await openReceiptDetails(user)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Delete receipt',
      }),
    )

    expect(within(dialog).getByText('Delete this receipt permanently?')).toBeInTheDocument()

    expect(onDelete).not.toHaveBeenCalled()
  })

  it('cancels receipt deletion', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onDelete={onDelete} />)

    const dialog = await openReceiptDetails(user)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Delete receipt',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    expect(onDelete).not.toHaveBeenCalled()

    expect(within(dialog).queryByText('Delete this receipt permanently?')).not.toBeInTheDocument()

    expect(dialog).toBeInTheDocument()
  })

  it('calls the delete handler after confirmation', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onDelete={onDelete} />)

    const dialog = await openReceiptDetails(user)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Delete receipt',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Confirm delete',
      }),
    )

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(testReceipts[0])

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('displays an error when receipt deletion fails', async () => {
    const user = userEvent.setup()

    const onDelete = vi.fn().mockRejectedValue(new Error('Delete failed'))

    render(<ReceiptsPage receipts={testReceipts} onDelete={onDelete} />)

    const dialog = await openReceiptDetails(user)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Delete receipt',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Confirm delete',
      }),
    )

    expect(
      await within(dialog).findByText('Unable to delete the receipt. Please try again.'),
    ).toBeInTheDocument()

    expect(dialog).toBeInTheDocument()
  })

  // Upload receipt modal

  it('opens the upload receipt modal', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    expect(dialog).toBeInTheDocument()

    expect(within(dialog).getByLabelText('Choose a receipt')).toBeInTheDocument()
  })

  it('closes the upload modal when Cancel is clicked', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not display a close button in the upload modal header', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    expect(
      within(dialog).queryByRole('button', {
        name: 'Close upload modal',
      }),
    ).not.toBeInTheDocument()
  })

  it('does not display development-related messages', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    expect(within(dialog).queryByText(/Only synthetic or test receipts/)).not.toBeInTheDocument()

    expect(
      within(dialog).queryByText(/Uploading will be enabled when the backend is connected/),
    ).not.toBeInTheDocument()
  })

  it('disables upload when no file is selected', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    expect(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    ).toBeDisabled()
  })

  it('disables upload when no upload handler is provided', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    const file = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    })

    await user.upload(within(dialog).getByLabelText('Choose a receipt'), file)

    expect(within(dialog).getByText('receipt.pdf')).toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    ).toBeDisabled()
  })

  // File validation

  it.each([
    ['receipt.pdf', 'application/pdf'],
    ['receipt.jpg', 'image/jpeg'],
    ['receipt.jpeg', 'image/jpeg'],
    ['receipt.png', 'image/png'],
  ])('accepts a valid file: %s', async (fileName, fileType) => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    const file = new File(['receipt'], fileName, {
      type: fileType,
    })

    await user.upload(within(dialog).getByLabelText('Choose a receipt'), file)

    expect(within(dialog).getByText(fileName)).toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    ).toBeEnabled()
  })

  it('rejects unsupported file types', async () => {
    const user = userEvent.setup({
      applyAccept: false,
    })

    const onUpload = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    const file = new File(['invalid file'], 'receipt.txt', {
      type: 'text/plain',
    })

    await user.upload(within(dialog).getByLabelText('Choose a receipt'), file)

    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Please select a PDF, JPEG or PNG file.',
    )

    expect(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    ).toBeDisabled()
  })

  it('rejects an empty file', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    const file = new File([], 'empty.pdf', {
      type: 'application/pdf',
    })

    await user.upload(within(dialog).getByLabelText('Choose a receipt'), file)

    expect(within(dialog).getByRole('alert')).toHaveTextContent('The selected file is empty.')
  })

  it('rejects files larger than 10 MB', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large-receipt.pdf', {
      type: 'application/pdf',
    })

    await user.upload(within(dialog).getByLabelText('Choose a receipt'), file)

    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'The file size must not exceed 10 MB.',
    )
  })

  it('accepts a file exactly 10 MB in size', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    const file = new File([new Uint8Array(10 * 1024 * 1024)], 'receipt.pdf', {
      type: 'application/pdf',
    })

    await user.upload(within(dialog).getByLabelText('Choose a receipt'), file)

    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    ).toBeEnabled()
  })

  // Remove selected file

  it('does not display the remove button before selecting a file', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    expect(
      within(dialog).queryByRole('button', {
        name: 'Remove selected file',
      }),
    ).not.toBeInTheDocument()
  })

  it('displays the remove button after selecting a file', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    await user.upload(
      within(dialog).getByLabelText('Choose a receipt'),
      new File(['receipt'], 'receipt.pdf', {
        type: 'application/pdf',
      }),
    )

    expect(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    ).toBeEnabled()

    expect(within(dialog).getByText('Ready to upload')).toBeInTheDocument()
  })

  it('removes the selected file when remove is clicked', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    const fileInput = within(dialog).getByLabelText('Choose a receipt') as HTMLInputElement

    const file = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    })

    await user.upload(fileInput, file)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    )

    expect(within(dialog).queryByText('receipt.pdf')).not.toBeInTheDocument()

    expect(fileInput.files).toHaveLength(0)
    expect(fileInput).toHaveValue('')

    expect(
      within(dialog).queryByRole('button', {
        name: 'Remove selected file',
      }),
    ).not.toBeInTheDocument()

    expect(dialog).toBeInTheDocument()
  })

  it('disables upload after removing the selected file', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    await user.upload(
      within(dialog).getByLabelText('Choose a receipt'),
      new File(['receipt'], 'receipt.pdf', {
        type: 'application/pdf',
      }),
    )

    const uploadButton = within(dialog).getByRole('button', {
      name: 'Upload receipt',
    })

    expect(uploadButton).toBeEnabled()

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    )

    expect(uploadButton).toBeDisabled()
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('allows the same file to be selected again after removal', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    const fileInput = within(dialog).getByLabelText('Choose a receipt')

    const file = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    })

    await user.upload(fileInput, file)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    )

    await user.upload(fileInput, file)

    expect(within(dialog).getByText('receipt.pdf')).toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    ).toBeEnabled()
  })

  it('allows another file to be selected after removal', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    const fileInput = within(dialog).getByLabelText('Choose a receipt')

    const firstFile = new File(['receipt'], 'tesco.pdf', {
      type: 'application/pdf',
    })

    const secondFile = new File(['receipt'], 'boots.png', {
      type: 'image/png',
    })

    await user.upload(fileInput, firstFile)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    )

    await user.upload(fileInput, secondFile)

    expect(within(dialog).queryByText('tesco.pdf')).not.toBeInTheDocument()

    expect(within(dialog).getByText('boots.png')).toBeInTheDocument()
  })

  it('clears the selected file when the modal is cancelled', async () => {
    const user = userEvent.setup()

    render(<ReceiptsPage receipts={testReceipts} />)

    const dialog = await openUploadModal(user)

    await user.upload(
      within(dialog).getByLabelText('Choose a receipt'),
      new File(['receipt'], 'receipt.pdf', {
        type: 'application/pdf',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    const reopenedDialog = await openUploadModal(user)

    expect(within(reopenedDialog).queryByText('receipt.pdf')).not.toBeInTheDocument()

    expect(
      within(reopenedDialog).queryByRole('button', {
        name: 'Remove selected file',
      }),
    ).not.toBeInTheDocument()
  })

  // Upload submission

  it('calls the upload handler with the selected file', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    const file = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    })

    await user.upload(within(dialog).getByLabelText('Choose a receipt'), file)

    expect(onUpload).not.toHaveBeenCalled()

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    )

    expect(onUpload).toHaveBeenCalledTimes(1)
    expect(onUpload).toHaveBeenCalledWith(file)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('does not upload a file when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue(undefined)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    await user.upload(
      within(dialog).getByLabelText('Choose a receipt'),
      new File(['receipt'], 'receipt.pdf', {
        type: 'application/pdf',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    )

    expect(onUpload).not.toHaveBeenCalled()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('disables file removal and cancellation while uploading', async () => {
    const user = userEvent.setup()

    let resolveUpload!: () => void

    const uploadPromise = new Promise<void>((resolve) => {
      resolveUpload = resolve
    })

    const onUpload = vi.fn().mockReturnValue(uploadPromise)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    await user.upload(
      within(dialog).getByLabelText('Choose a receipt'),
      new File(['receipt'], 'receipt.pdf', {
        type: 'application/pdf',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    )

    expect(
      within(dialog).getByRole('button', {
        name: 'Uploading...',
      }),
    ).toBeDisabled()

    expect(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    ).toBeDisabled()

    expect(
      within(dialog).getByRole('button', {
        name: 'Cancel',
      }),
    ).toBeDisabled()

    expect(within(dialog).getByLabelText('Choose a receipt')).toBeDisabled()

    resolveUpload()

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('displays an error when uploading fails', async () => {
    const user = userEvent.setup()

    const onUpload = vi.fn().mockRejectedValue(new Error('Upload failed'))

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    await user.upload(
      within(dialog).getByLabelText('Choose a receipt'),
      new File(['receipt'], 'receipt.pdf', {
        type: 'application/pdf',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Unable to upload the receipt. Please try again.',
    )

    expect(dialog).toBeInTheDocument()

    expect(within(dialog).getByText('receipt.pdf')).toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    ).toBeEnabled()

    expect(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    ).toBeEnabled()
  })

  it('clears the upload error when the selected file is removed', async () => {
    const user = userEvent.setup()

    const onUpload = vi.fn().mockRejectedValue(new Error('Upload failed'))

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    await user.upload(
      within(dialog).getByLabelText('Choose a receipt'),
      new File(['receipt'], 'receipt.pdf', {
        type: 'application/pdf',
      }),
    )

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    )

    expect(await within(dialog).findByRole('alert')).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Remove selected file',
      }),
    )

    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()

    expect(within(dialog).queryByText('receipt.pdf')).not.toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    ).toBeDisabled()
  })

  it('allows the user to retry a failed upload', async () => {
    const user = userEvent.setup()

    const onUpload = vi
      .fn()
      .mockRejectedValueOnce(new Error('Upload failed'))
      .mockResolvedValueOnce(undefined)

    render(<ReceiptsPage receipts={testReceipts} onUpload={onUpload} />)

    const dialog = await openUploadModal(user)

    const file = new File(['receipt'], 'receipt.pdf', {
      type: 'application/pdf',
    })

    await user.upload(within(dialog).getByLabelText('Choose a receipt'), file)

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    )

    expect(await within(dialog).findByRole('alert')).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', {
        name: 'Upload receipt',
      }),
    )

    expect(onUpload).toHaveBeenCalledTimes(2)
    expect(onUpload).toHaveBeenNthCalledWith(1, file)
    expect(onUpload).toHaveBeenNthCalledWith(2, file)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
