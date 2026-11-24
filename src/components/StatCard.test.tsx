import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatCard from './StatCard'

describe('StatCard', () => {
  it('displays the supplied statistics', () => {
    render(<StatCard label="Total receipts" value="128" description="Sample collection" />)

    expect(screen.getByText('Total receipts')).toBeInTheDocument()
    expect(screen.getByText('128')).toBeInTheDocument()
    expect(screen.getByText('Sample collection')).toBeInTheDocument()
  })
})
