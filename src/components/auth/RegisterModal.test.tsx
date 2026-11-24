import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RegisterModal from './RegisterModal'

describe('RegisterModal', () => {
  const onClose = vi.fn()
  const onLoginClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    render(<RegisterModal onClose={onClose} onLoginClick={onLoginClick} />)
  })

  describe('Modal rendering', () => {
    it('displays the registration dialog', () => {
      expect(
        screen.getByRole('dialog', {
          name: 'Create a Recora account',
        }),
      ).toBeVisible()
    })

    it('displays the registration heading', () => {
      expect(
        screen.getByRole('heading', {
          name: 'Create a Recora account',
        }),
      ).toBeInTheDocument()
    })

    it('displays the registration description', () => {
      expect(
        screen.getByText(
          'Start organising your receipts, tracking spending and managing important dates.',
        ),
      ).toBeInTheDocument()
    })

    it('displays the existing account message', () => {
      expect(screen.getByText('Already have an account?')).toBeInTheDocument()
    })
  })

  describe('Registration form fields', () => {
    it.each([
      ['Full name', 'text'],
      ['Email address', 'email'],
      ['Password', 'password'],
      ['Confirm password', 'password'],
    ])('displays %s with input type %s', (label, inputType) => {
      expect(screen.getByLabelText(label, { exact: true })).toHaveAttribute('type', inputType)
    })

    it.each(['Full name', 'Email address', 'Password', 'Confirm password'])(
      'makes %s a required field',
      (label) => {
        expect(screen.getByLabelText(label, { exact: true })).toBeRequired()
      },
    )

    it.each([
      ['Full name', 'name'],
      ['Email address', 'email'],
      ['Password', 'new-password'],
      ['Confirm password', 'new-password'],
    ])('configures autocomplete for %s', (label, autocomplete) => {
      expect(screen.getByLabelText(label, { exact: true })).toHaveAttribute(
        'autocomplete',
        autocomplete,
      )
    })

    it.each([
      ['Full name', 'Test User'],
      ['Email address', 'test@example.com'],
      ['Password', 'ExamplePassword123!'],
      ['Confirm password', 'ExamplePassword123!'],
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

  describe('Registration button rendering', () => {
    it('displays the create account submit button as disabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Create account',
        }),
      ).toBeDisabled()
    })

    it('displays the login navigation button as enabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Log in',
        }),
      ).toBeEnabled()
    })

    it('displays the close button as enabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Close registration modal',
        }),
      ).toBeEnabled()
    })
  })

  describe('Registration modal interactions', () => {
    it('requests login when the login button is clicked', () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Log in',
        }),
      )

      expect(onLoginClick).toHaveBeenCalledTimes(1)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('requests closure when the close button is clicked', () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Close registration modal',
        }),
      )

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onLoginClick).not.toHaveBeenCalled()
    })

    it('requests closure when the dialog is cancelled', () => {
      fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onLoginClick).not.toHaveBeenCalled()
    })

    it('does not invoke callbacks when initially rendered', () => {
      expect(onClose).not.toHaveBeenCalled()
      expect(onLoginClick).not.toHaveBeenCalled()
    })
  })
})
