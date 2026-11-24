import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('displays the welcome heading', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        name: 'Welcome to Recora',
      }),
    ).toBeInTheDocument()
  })

  it('displays the homepage subtitle', () => {
    render(<HomePage />)

    expect(screen.getByText(/Your everyday, understood/i)).toBeInTheDocument()
  })

  it('displays the introductory banner', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        name: 'Less paperwork. More peace of mind.',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/Save your shopping receipts/i)).toBeInTheDocument()
  })

  it('displays the create account button as disabled', () => {
    render(<HomePage />)

    const button = screen.getByRole('button', {
      name: /Create your account/i,
    })

    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('displays the illustrative statistics section', () => {
    render(<HomePage />)

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
    render(<HomePage />)

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
    render(<HomePage />)

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
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        name: 'Ready to make Recora yours?',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Your own receipts and spending appear only after you sign in.'),
    ).toBeInTheDocument()
  })

  it('displays the final login button as disabled', () => {
    render(<HomePage />)

    const loginButton = screen.getByRole('button', {
      name: 'Log in',
    })

    expect(loginButton).toBeInTheDocument()
    expect(loginButton).toBeDisabled()
  })

  it('displays the final create account button as disabled', () => {
    render(<HomePage />)

    const createAccountButton = screen.getByRole('button', {
      name: 'Create account',
    })

    expect(createAccountButton).toBeInTheDocument()
    expect(createAccountButton).toBeDisabled()
  })

  it('displays the prototype disclaimer footer', () => {
    render(<HomePage />)

    expect(
      screen.getByText(
        'All numbers and receipts above are illustrative examples. This prototype has no real authentication or server connection.',
      ),
    ).toBeInTheDocument()
  })
})
