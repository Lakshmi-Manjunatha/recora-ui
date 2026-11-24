import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ReceiptPreview from './ReceiptPreview'

describe('ReceiptPreview', () => {
  it('displays an example receipt', () => {
    render(
      <ReceiptPreview
        merchant="Tesco"
        description="Milk, bread, apples and more"
        amount="£11.00"
      />,
    )

    expect(screen.getByText('Tesco · Example receipt')).toBeInTheDocument()
    expect(screen.getByText('Milk, bread, apples and more')).toBeInTheDocument()
    expect(screen.getByText('£11.00')).toBeInTheDocument()
  })
})
