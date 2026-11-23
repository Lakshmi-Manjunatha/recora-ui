import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Sidebar from './Sidebar'

describe('Sidebar Component', () => {
  it('should display the Recora brand', () => {
    render(<Sidebar />)

    expect(screen.getByText('Recora')).toBeInTheDocument()
  })

  it('should display all five navigation options', () => {
    render(<Sidebar />)

    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Receipts' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Ask AI' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Events' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Insights' })).toBeInTheDocument()
  })

  it('should highlight Home by default', () => {
    render(<Sidebar />)

    const homeButton = screen.getByRole('button', {
      name: 'Home',
    })

    expect(homeButton).toHaveClass('active')
  })
})
