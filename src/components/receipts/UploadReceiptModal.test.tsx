import { render, screen, within, waitFor } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import { describe, expect, it, vi } from 'vitest'

import UploadReceiptModal from './UploadReceiptModal'

const MB = 1024 * 1024

function createFile(name: string, size = 1024, type = 'application/pdf') {
  return new File([new Uint8Array(size)], name, {
    type,
    lastModified: 1000,
  })
}

function setup() {
  const onClose = vi.fn()

  const onUpload = vi.fn(async () => {})

  const user = userEvent.setup({
    applyAccept: false,
  })

  render(<UploadReceiptModal onClose={onClose} onUpload={onUpload} />)

  const input = screen.getByLabelText('Choose receipts') as HTMLInputElement

  return {
    user,
    input,
    onClose,
    onUpload,
  }
}

describe('UploadReceiptModal', () => {
  it('renders the upload dialog', () => {
    setup()

    expect(
      screen.getByRole('dialog', {
        name: 'Upload receipts',
      }),
    ).toBeInTheDocument()
  })

  it('supports multiple file selection', () => {
    const { input } = setup()

    expect(input).toHaveAttribute('multiple')
  })

  it('disables upload when no files are selected', () => {
    setup()

    expect(
      screen.getByRole('button', {
        name: 'Upload receipts',
      }),
    ).toBeDisabled()
  })

  it('disables upload when no handler is provided', async () => {
    const user = userEvent.setup()

    render(<UploadReceiptModal onClose={vi.fn()} />)

    await user.upload(screen.getByLabelText('Choose receipts'), createFile('receipt.pdf'))

    expect(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    ).toBeDisabled()
  })

  it('keeps original files by default', () => {
    setup()

    expect(
      screen.getByRole('checkbox', {
        name: 'Keep original receipt files',
      }),
    ).toBeChecked()
  })

  it('allows original file storage to be disabled', async () => {
    const { user } = setup()

    const checkbox = screen.getByRole('checkbox', {
      name: 'Keep original receipt files',
    })

    await user.click(checkbox)

    expect(checkbox).not.toBeChecked()

    expect(
      screen.getByText(
        'Only extracted receipt information will be saved. Original files cannot be retrieved later.',
      ),
    ).toBeInTheDocument()
  })

  it.each([
    ['receipt.pdf', 'application/pdf'],
    ['receipt.jpg', 'image/jpeg'],
    ['receipt.jpeg', 'image/jpeg'],
    ['receipt.png', 'image/png'],
  ])('accepts %s', async (name, type) => {
    const { user, input } = setup()

    await user.upload(input, createFile(name, 1024, type))

    expect(screen.getByText(name)).toBeInTheDocument()
  })

  it('accepts multiple files together', async () => {
    const { user, input } = setup()

    await user.upload(input, [
      createFile('tesco.pdf'),
      createFile('boots.pdf'),
      createFile('currys.pdf'),
    ])

    expect(screen.getByText('3 of 10 files selected')).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Upload 3 receipts',
      }),
    ).toBeEnabled()
  })

  it('appends files from subsequent selections', async () => {
    const { user, input } = setup()

    await user.upload(input, createFile('tesco.pdf'))

    await user.upload(input, createFile('boots.pdf'))

    expect(screen.getByText('2 of 10 files selected')).toBeInTheDocument()
  })

  it('rejects unsupported file formats', async () => {
    const { user, input } = setup()

    await user.upload(input, createFile('receipt.exe', 1024, 'application/octet-stream'))

    expect(screen.getByRole('alert')).toHaveTextContent('Please select a PDF, JPEG or PNG file.')

    expect(
      screen.queryByRole('button', {
        name: 'Remove receipt.exe',
      }),
    ).not.toBeInTheDocument()
  })

  it('rejects empty files', async () => {
    const { user, input } = setup()

    await user.upload(input, createFile('empty.pdf', 0))

    expect(screen.getByRole('alert')).toHaveTextContent('The selected file is empty.')
  })

  it('accepts exactly 4 MB', async () => {
    const { user, input } = setup()

    await user.upload(input, createFile('receipt.pdf', 4 * MB))

    expect(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    ).toBeEnabled()
  })

  it('rejects files larger than 4 MB', async () => {
    const { user, input } = setup()

    await user.upload(input, createFile('large.pdf', 4 * MB + 1))

    expect(screen.getByRole('alert')).toHaveTextContent('The file size must not exceed 4 MB.')
  })

  it('accepts exactly 10 MB combined', async () => {
    const { user, input } = setup()

    await user.upload(input, [
      createFile('first.pdf', 4 * MB),
      createFile('second.pdf', 4 * MB),
      createFile('third.pdf', 2 * MB),
    ])

    expect(screen.getByText('3 of 10 files selected')).toBeInTheDocument()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('rejects files exceeding the combined limit', async () => {
    const { user, input } = setup()

    await user.upload(input, [
      createFile('first.pdf', 4 * MB),
      createFile('second.pdf', 4 * MB),
      createFile('third.pdf', 2 * MB + 1),
    ])

    expect(screen.getByRole('alert')).toHaveTextContent('Combined file size must not exceed 10 MB.')

    expect(screen.getByText('2 of 10 files selected')).toBeInTheDocument()
  })

  it('accepts a maximum of 10 files', async () => {
    const { user, input } = setup()

    const files = Array.from({ length: 10 }, (_, index) => createFile(`receipt-${index}.pdf`))

    await user.upload(input, files)

    expect(screen.getByText('10 of 10 files selected')).toBeInTheDocument()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('rejects the eleventh file', async () => {
    const { user, input } = setup()

    const files = Array.from({ length: 11 }, (_, index) => createFile(`receipt-${index}.pdf`))

    await user.upload(input, files)

    expect(screen.getByRole('alert')).toHaveTextContent('Maximum 10 files allowed per batch.')

    expect(screen.getByText('10 of 10 files selected')).toBeInTheDocument()
  })

  it('prevents duplicate file selection', async () => {
    const { user, input } = setup()

    const file = createFile('receipt.pdf')

    await user.upload(input, file)
    await user.upload(input, file)

    expect(screen.getByRole('alert')).toHaveTextContent('This file has already been selected.')

    expect(screen.getByText('1 of 10 files selected')).toBeInTheDocument()
  })

  it('retains valid files when another file is invalid', async () => {
    const { user, input } = setup()

    await user.upload(input, [createFile('valid.pdf'), createFile('empty.pdf', 0)])

    expect(screen.getByText('valid.pdf')).toBeInTheDocument()

    expect(screen.getByRole('alert')).toHaveTextContent('The selected file is empty.')

    expect(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    ).toBeEnabled()
  })

  it('removes an individual file', async () => {
    const { user, input } = setup()

    await user.upload(input, [createFile('tesco.pdf'), createFile('boots.pdf')])

    await user.click(
      screen.getByRole('button', {
        name: 'Remove tesco.pdf',
      }),
    )

    expect(screen.queryByText('tesco.pdf')).not.toBeInTheDocument()

    expect(screen.getByText('boots.pdf')).toBeInTheDocument()
  })

  it('removes all selected files', async () => {
    const { user, input } = setup()

    await user.upload(input, [createFile('tesco.pdf'), createFile('boots.pdf')])

    await user.click(
      screen.getByRole('button', {
        name: 'Remove all',
      }),
    )

    expect(screen.getByText('0 of 10 files selected')).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Upload receipts',
      }),
    ).toBeDisabled()
  })

  it('allows a removed file to be selected again', async () => {
    const { user, input } = setup()

    const file = createFile('receipt.pdf')

    await user.upload(input, file)

    await user.click(
      screen.getByRole('button', {
        name: 'Remove receipt.pdf',
      }),
    )

    await user.upload(input, file)

    expect(screen.getByText('receipt.pdf')).toBeInTheDocument()
  })

  it('clears validation errors when removing all files', async () => {
    const { user, input } = setup()

    const file = createFile('receipt.pdf')

    await user.upload(input, file)
    await user.upload(input, file)

    await user.click(
      screen.getByRole('button', {
        name: 'Remove all',
      }),
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('uploads files with original storage enabled', async () => {
    const { user, input, onUpload, onClose } = setup()

    const files = [createFile('tesco.pdf'), createFile('boots.pdf')]

    await user.upload(input, files)

    await user.click(
      screen.getByRole('button', {
        name: 'Upload 2 receipts',
      }),
    )

    expect(onUpload).toHaveBeenCalledTimes(1)

    expect(onUpload).toHaveBeenCalledWith({
      files,
      keepOriginalFiles: true,
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('uploads files without retaining originals', async () => {
    const { user, input, onUpload } = setup()

    const file = createFile('receipt.pdf')

    await user.upload(input, file)

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Keep original receipt files',
      }),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    )

    expect(onUpload).toHaveBeenCalledWith({
      files: [file],
      keepOriginalFiles: false,
    })
  })

  it('cancels without uploading', async () => {
    const { user, onClose, onUpload } = setup()

    await user.click(
      screen.getByRole('button', {
        name: 'Cancel',
      }),
    )

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('retains selected files after upload failure', async () => {
    const { user, input, onUpload, onClose } = setup()

    onUpload.mockRejectedValueOnce(new Error('Network error'))

    await user.upload(input, createFile('receipt.pdf'))

    await user.click(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to upload the receipts. Please try again.',
    )

    expect(screen.getByText('receipt.pdf')).toBeInTheDocument()

    expect(onClose).not.toHaveBeenCalled()

    expect(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    ).toBeEnabled()
  })

  it('allows retrying after upload failure', async () => {
    const { user, input, onUpload, onClose } = setup()

    const file = createFile('receipt.pdf')

    onUpload.mockRejectedValueOnce(new Error('Network error'))

    await user.upload(input, file)

    await user.click(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    )

    await screen.findByRole('alert')

    await user.click(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    )

    expect(onUpload).toHaveBeenCalledTimes(2)

    expect(onUpload).toHaveBeenLastCalledWith({
      files: [file],
      keepOriginalFiles: true,
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('disables controls while uploading', async () => {
    const { user, input, onUpload } = setup()

    onUpload.mockImplementationOnce(() => new Promise<void>(() => {}))

    await user.upload(input, createFile('receipt.pdf'))

    await user.click(
      screen.getByRole('button', {
        name: 'Upload 1 receipt',
      }),
    )

    expect(input).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: 'Uploading...',
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: 'Cancel',
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: 'Remove receipt.pdf',
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole('button', {
        name: 'Remove all',
      }),
    ).toBeDisabled()

    expect(
      screen.getByRole('checkbox', {
        name: 'Keep original receipt files',
      }),
    ).toBeDisabled()
  })

  it('does not display a top close button', () => {
    setup()

    const dialog = screen.getByRole('dialog')

    expect(
      within(dialog).queryByRole('button', {
        name: 'Close upload modal',
      }),
    ).not.toBeInTheDocument()
  })
})
