import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
  const onLoginClick = vi.fn()
  const onRegisterClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    render(<HomePage onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />)
  })

  describe('Homepage rendering', () => {
    it('displays the welcome heading', () => {
      expect(
        screen.getByRole('heading', {
          name: 'Welcome to Recora',
        }),
      ).toBeInTheDocument()
    })

    it('displays the homepage subtitle', () => {
      expect(screen.getByText(/Your everyday, understood/i)).toBeInTheDocument()
    })

    it('displays the introductory banner', () => {
      expect(
        screen.getByRole('heading', {
          name: 'Less paperwork. More peace of mind.',
        }),
      ).toBeInTheDocument()

      expect(screen.getByText(/Save your shopping receipts/i)).toBeInTheDocument()
    })

    it('displays the illustrative statistics section', () => {
      expect(
        screen.getByRole('heading', {
          name: 'See what Recora can do',
        }),
      ).toBeInTheDocument()

      expect(screen.getByText('Illustrative demo data')).toBeInTheDocument()

      expect(screen.getByText('£38.90')).toBeInTheDocument()
      expect(screen.getByText('11')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('displays the example receipts', () => {
      expect(
        screen.getByRole('heading', {
          name: 'Your receipts, together',
        }),
      ).toBeInTheDocument()

      expect(screen.getByText('Tesco · Example receipt')).toBeInTheDocument()

      expect(screen.getByText('£11.00')).toBeInTheDocument()

      expect(screen.getByText('Sainsbury’s · Example receipt')).toBeInTheDocument()

      expect(screen.getByText('£27.90')).toBeInTheDocument()
    })

    it('displays the three feature previews', () => {
      expect(
        screen.getByRole('heading', {
          name: 'Explore more with Recora',
        }),
      ).toBeInTheDocument()

      expect(screen.getByRole('heading', { name: 'Ask AI' })).toBeInTheDocument()

      expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument()

      expect(screen.getByRole('heading', { name: 'Insights' })).toBeInTheDocument()
    })

    it('displays the final call-to-action section', () => {
      expect(
        screen.getByRole('heading', {
          name: 'Ready to make Recora yours?',
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByText('Your own receipts and spending appear only after you sign in.'),
      ).toBeInTheDocument()
    })

    it('displays the prototype disclaimer footer', () => {
      expect(
        screen.getByText(
          'All numbers and receipts above are illustrative examples. This prototype has no real authentication or server connection.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Authentication button rendering', () => {
    it('displays the introductory create account button as enabled', () => {
      expect(
        screen.getByRole('button', {
          name: /Create your account/i,
        }),
      ).toBeEnabled()
    })

    it('displays the final login button as enabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Log in',
        }),
      ).toBeEnabled()
    })

    it('displays the final create account button as enabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Create account',
        }),
      ).toBeEnabled()
    })
  })

  describe('Authentication button interactions', () => {
    it('requests registration when the introductory create account button is clicked', () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: /Create your account/i,
        }),
      )

      expect(onRegisterClick).toHaveBeenCalledTimes(1)
      expect(onLoginClick).not.toHaveBeenCalled()
    })

    it('requests login when the final login button is clicked', () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Log in',
        }),
      )

      expect(onLoginClick).toHaveBeenCalledTimes(1)
      expect(onRegisterClick).not.toHaveBeenCalled()
    })

    it('requests registration when the final create account button is clicked', () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Create account',
        }),
      )

      expect(onRegisterClick).toHaveBeenCalledTimes(1)
      expect(onLoginClick).not.toHaveBeenCalled()
    })

    it('does not request authentication when the homepage initially renders', () => {
      expect(onLoginClick).not.toHaveBeenCalled()
      expect(onRegisterClick).not.toHaveBeenCalled()
    })
  })
})
