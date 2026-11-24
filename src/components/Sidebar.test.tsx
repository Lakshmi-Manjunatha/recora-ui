import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  const onLoginRequired = vi.fn()

  const navigationItems = ['Home', 'Receipts', 'Ask AI', 'Events', 'Insights']

  const protectedNavigationItems = ['Receipts', 'Ask AI', 'Events', 'Insights']

  beforeEach(() => {
    vi.clearAllMocks()

    render(<Sidebar onLoginRequired={onLoginRequired} />)
  })

  describe('Sidebar rendering', () => {
    it('should render the Recora brand', () => {
      expect(screen.getByText('Recora')).toBeInTheDocument()
    })

    it('should render the navigation section', () => {
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should render five navigation buttons', () => {
      expect(screen.getAllByRole('button')).toHaveLength(5)
    })

    it.each(navigationItems)('should render the %s navigation button', (navigationItem) => {
      expect(screen.getByRole('button', { name: navigationItem })).toBeInTheDocument()
    })
  })

  describe('Navigation active state', () => {
    it('should mark Home as the active navigation item', () => {
      expect(screen.getByRole('button', { name: 'Home' })).toHaveClass('active')
    })

    it.each(protectedNavigationItems)(
      'should not mark %s as an active navigation item',
      (navigationItem) => {
        expect(screen.getByRole('button', { name: navigationItem })).not.toHaveClass('active')
      },
    )
  })

  describe('Sidebar bottom section', () => {
    it('should render the sidebar bottom heading', () => {
      expect(screen.getByText('🌱 Your everyday, understood.')).toBeInTheDocument()
    })

    it('should render the sidebar bottom description', () => {
      expect(
        screen.getByText('Keep receipts, shopping insights and important dates in one calm place.'),
      ).toBeInTheDocument()
    })
  })

  describe('Login required navigation', () => {
    it.each(protectedNavigationItems)(
      'should request login when %s is clicked',
      (navigationItem) => {
        fireEvent.click(screen.getByRole('button', { name: navigationItem }))

        expect(onLoginRequired).toHaveBeenCalledTimes(1)
      },
    )

    it('should not request login when Home is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Home' }))

      expect(onLoginRequired).not.toHaveBeenCalled()
    })
  })
})
