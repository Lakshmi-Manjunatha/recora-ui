import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginModal from './LoginModal'

describe('LoginModal', () => {
  const onClose = vi.fn()
  const onRegisterClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    render(<LoginModal onClose={onClose} onRegisterClick={onRegisterClick} />)
  })

  describe('Modal rendering', () => {
    it('displays the login dialog', () => {
      expect(
        screen.getByRole('dialog', {
          name: 'Log in to Recora',
        }),
      ).toBeVisible()
    })

    it('displays the login heading', () => {
      expect(
        screen.getByRole('heading', {
          name: 'Log in to Recora',
        }),
      ).toBeInTheDocument()
    })

    it('displays the login description', () => {
      expect(
        screen.getByText('Access your receipts, events and personal spending insights.'),
      ).toBeInTheDocument()
    })

    it('displays the new account message', () => {
      expect(screen.getByText('New to Recora?')).toBeInTheDocument()
    })
  })

  describe('Login form fields', () => {
    it.each([
      ['Email address', 'email'],
      ['Password', 'password'],
    ])('displays %s with input type %s', (label, inputType) => {
      expect(screen.getByLabelText(label, { exact: true })).toHaveAttribute('type', inputType)
    })

    it.each(['Email address', 'Password'])('makes %s a required field', (label) => {
      expect(screen.getByLabelText(label, { exact: true })).toBeRequired()
    })

    it.each([
      ['Email address', 'email'],
      ['Password', 'current-password'],
    ])('configures autocomplete for %s', (label, autocomplete) => {
      expect(screen.getByLabelText(label, { exact: true })).toHaveAttribute(
        'autocomplete',
        autocomplete,
      )
    })

    it.each([
      ['Email address', 'test@example.com'],
      ['Password', 'ExamplePassword123!'],
    ])('allows the user to enter %s', (label, value) => {
      const input = screen.getByLabelText(label, {
        exact: true,
      })

      fireEvent.change(input, {
        target: { value },
      })

      expect(input).toHaveValue(value)
    })
  })

  describe('Login button rendering', () => {
    it('displays the login submit button as disabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Log in',
        }),
      ).toBeDisabled()
    })

    it('displays the create account button as enabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Create an account',
        }),
      ).toBeEnabled()
    })

    it('displays the close button as enabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Close login modal',
        }),
      ).toBeEnabled()
    })
  })

  describe('Login modal interactions', () => {
    it('requests registration when create account is clicked', () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Create an account',
        }),
      )

      expect(onRegisterClick).toHaveBeenCalledTimes(1)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('requests closure when the close button is clicked', () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Close login modal',
        }),
      )

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onRegisterClick).not.toHaveBeenCalled()
    })

    it('requests closure when the dialog is cancelled', () => {
      fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onRegisterClick).not.toHaveBeenCalled()
    })

    it('does not invoke callbacks when initially rendered', () => {
      expect(onClose).not.toHaveBeenCalled()
      expect(onRegisterClick).not.toHaveBeenCalled()
    })
  })
})
