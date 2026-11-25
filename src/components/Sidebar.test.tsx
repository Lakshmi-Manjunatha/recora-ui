import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  const onLoginRequired = vi.fn()
  const onReceiptsClick = vi.fn()
  const onHomeClick = vi.fn()

  const navigationItems = ['Home', 'Receipts', 'Ask AI', 'Insights']

  const protectedNavigationItems = ['Ask AI', 'Insights']

  const defaultProps = {
    onLoginRequired,
    onReceiptsClick,
    onHomeClick,
    activePage: 'home' as const,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Sidebar rendering', () => {
    beforeEach(() => {
      render(<Sidebar {...defaultProps} />)
    })

    it('should render the Recora brand', () => {
      expect(screen.getByText('Recora')).toBeInTheDocument()
    })

    it('should render the navigation section', () => {
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should render four navigation buttons', () => {
      expect(screen.getAllByRole('button')).toHaveLength(4)
    })

    it.each(navigationItems)('should render the %s navigation button', (navigationItem) => {
      expect(screen.getByRole('button', { name: navigationItem })).toBeInTheDocument()
    })

    it.each(navigationItems)('should enable the %s navigation button', (navigationItem) => {
      expect(screen.getByRole('button', { name: navigationItem })).toBeEnabled()
    })

    it('should not render the Events navigation button', () => {
      expect(screen.queryByRole('button', { name: 'Events' })).not.toBeInTheDocument()
    })
  })

  describe('Navigation active state', () => {
    it('should mark Home as the active navigation item', () => {
      render(<Sidebar {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Home' })).toHaveClass('active')
    })

    it.each(['Receipts', 'Ask AI', 'Insights'])(
      'should not mark %s as active when Home is selected',
      (navigationItem) => {
        render(<Sidebar {...defaultProps} />)

        expect(screen.getByRole('button', { name: navigationItem })).not.toHaveClass('active')
      },
    )

    it('should mark Receipts as the active navigation item', () => {
      render(<Sidebar {...defaultProps} activePage="receipts" />)

      expect(screen.getByRole('button', { name: 'Receipts' })).toHaveClass('active')
    })

    it.each(['Home', 'Ask AI', 'Insights'])(
      'should not mark %s as active when Receipts is selected',
      (navigationItem) => {
        render(<Sidebar {...defaultProps} activePage="receipts" />)

        expect(screen.getByRole('button', { name: navigationItem })).not.toHaveClass('active')
      },
    )

    it('should update the active navigation item from Home to Receipts', () => {
      const { rerender } = render(<Sidebar {...defaultProps} />)

      rerender(<Sidebar {...defaultProps} activePage="receipts" />)

      expect(screen.getByRole('button', { name: 'Receipts' })).toHaveClass('active')

      expect(screen.getByRole('button', { name: 'Home' })).not.toHaveClass('active')
    })

    it('should update the active navigation item from Receipts to Home', () => {
      const { rerender } = render(<Sidebar {...defaultProps} activePage="receipts" />)

      rerender(<Sidebar {...defaultProps} activePage="home" />)

      expect(screen.getByRole('button', { name: 'Home' })).toHaveClass('active')

      expect(screen.getByRole('button', { name: 'Receipts' })).not.toHaveClass('active')
    })
  })

  describe('Sidebar bottom section', () => {
    beforeEach(() => {
      render(<Sidebar {...defaultProps} />)
    })

    it('should render the sidebar bottom heading', () => {
      expect(screen.getByText('🌱 Your everyday, understood.')).toBeInTheDocument()
    })

    it('should render the sidebar bottom description', () => {
      expect(
        screen.getByText('Keep receipts, shopping insights and important dates in one calm place.'),
      ).toBeInTheDocument()
    })
  })

  describe('Home navigation', () => {
    beforeEach(() => {
      render(<Sidebar {...defaultProps} />)
    })

    it('should call onHomeClick when Home is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Home' }))

      expect(onHomeClick).toHaveBeenCalledTimes(1)
    })

    it('should not request login when Home is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Home' }))

      expect(onLoginRequired).not.toHaveBeenCalled()
    })

    it('should not call onReceiptsClick when Home is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Home' }))

      expect(onReceiptsClick).not.toHaveBeenCalled()
    })
  })

  describe('Receipts navigation', () => {
    beforeEach(() => {
      render(<Sidebar {...defaultProps} />)
    })

    it('should call onReceiptsClick when Receipts is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Receipts' }))

      expect(onReceiptsClick).toHaveBeenCalledTimes(1)
    })

    it('should not directly request login when Receipts is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Receipts' }))

      expect(onLoginRequired).not.toHaveBeenCalled()
    })

    it('should not call onHomeClick when Receipts is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Receipts' }))

      expect(onHomeClick).not.toHaveBeenCalled()
    })
  })

  describe('Login required navigation', () => {
    beforeEach(() => {
      render(<Sidebar {...defaultProps} />)
    })

    it.each(protectedNavigationItems)(
      'should request login when %s is clicked',
      (navigationItem) => {
        fireEvent.click(screen.getByRole('button', { name: navigationItem }))

        expect(onLoginRequired).toHaveBeenCalledTimes(1)
      },
    )

    it.each(protectedNavigationItems)(
      'should not call other navigation handlers when %s is clicked',
      (navigationItem) => {
        fireEvent.click(screen.getByRole('button', { name: navigationItem }))

        expect(onHomeClick).not.toHaveBeenCalled()
        expect(onReceiptsClick).not.toHaveBeenCalled()
      },
    )
  })

  describe('Initial rendering behaviour', () => {
    it('should not call navigation handlers on initial render', () => {
      render(<Sidebar {...defaultProps} />)

      expect(onHomeClick).not.toHaveBeenCalled()
      expect(onReceiptsClick).not.toHaveBeenCalled()
      expect(onLoginRequired).not.toHaveBeenCalled()
    })
  })
})
