import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Header from './Header'

describe('Header', () => {
  const onLoginClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    render(<Header onLoginClick={onLoginClick} />)
  })

  describe('Header rendering', () => {
    it('displays the application header', () => {
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('displays the homepage breadcrumb', () => {
      expect(screen.getByText('RECORA / HOME')).toBeInTheDocument()
    })

    it('displays the login button', () => {
      expect(
        screen.getByRole('button', {
          name: 'Log in',
        }),
      ).toBeInTheDocument()
    })

    it('displays the login button as enabled', () => {
      expect(
        screen.getByRole('button', {
          name: 'Log in',
        }),
      ).toBeEnabled()
    })

    it('does not display a create account button', () => {
      expect(
        screen.queryByRole('button', {
          name: /create account/i,
        }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Authentication button interactions', () => {
    it('requests login when the login button is clicked', () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Log in',
        }),
      )

      expect(onLoginClick).toHaveBeenCalledTimes(1)
    })

    it('does not request login when initially rendered', () => {
      expect(onLoginClick).not.toHaveBeenCalled()
    })
  })
})
