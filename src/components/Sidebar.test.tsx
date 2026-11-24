import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  it('displays the Recora brand name', () => {
    render(<Sidebar />)

    expect(screen.getByText('Recora')).toBeInTheDocument()
  })

  it('displays the sidebar navigation', () => {
    render(<Sidebar />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('displays all five navigation buttons', () => {
    render(<Sidebar />)

    const navigation = screen.getByRole('navigation')

    expect(within(navigation).getAllByRole('button')).toHaveLength(5)
  })
  it.each(['Home', 'Receipts', 'Ask AI', 'Events', 'Insights'])(
    'displays the %s navigation button',
    (name) => {
      render(<Sidebar />)

      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    },
  )

  it('displays Home as the default active navigation item', () => {
    render(<Sidebar />)

    expect(screen.getByRole('button', { name: 'Home' })).toHaveClass('active')
  })

  it.each(['Receipts', 'Ask AI', 'Events', 'Insights'])(
    'displays %s as an inactive navigation item by default',
    (name) => {
      render(<Sidebar />)

      expect(screen.getByRole('button', { name })).not.toHaveClass('active')
    },
  )

  it('displays the sidebar information panel heading', () => {
    render(<Sidebar />)

    expect(screen.getByText('🌱 Your everyday, understood.')).toBeInTheDocument()
  })

  it('displays the sidebar information panel description', () => {
    render(<Sidebar />)

    expect(
      screen.getByText('Keep receipts, shopping insights and important dates in one calm place.'),
    ).toBeInTheDocument()
  })
})
