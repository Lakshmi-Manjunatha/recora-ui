import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Header from './Header'

describe('Header', () => {
  const onLoginClick = vi.fn()
  const onLogoutClick = vi.fn()

  const defaultProps = {
    pageName: 'Home',
    isAuthenticated: false,
    userName: '',
    onLoginClick,
    onLogoutClick,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the header', () => {
    render(<Header {...defaultProps} />)

    expect(
        screen.getByRole('banner'),
    ).toBeInTheDocument()
  })

  it.each([
    ['Home', 'RECORA / HOME'],
    ['Receipts', 'RECORA / RECEIPTS'],
    ['Ask AI', 'RECORA / ASK AI'],
    ['Events', 'RECORA / EVENTS'],
    ['Insights', 'RECORA / INSIGHTS'],
    ['Settings', 'RECORA / SETTINGS'],
    ['Dashboard', 'RECORA / DASHBOARD'],
  ])('displays the breadcrumb for %s', (pageName, expected) => {
    render(
        <Header {...defaultProps} pageName={pageName} />,
    )

    expect(
        screen.getByText(expected),
    ).toBeInTheDocument()
  })

  it('updates the breadcrumb when the page changes', () => {
    const { rerender } = render(
        <Header {...defaultProps} />,
    )

    rerender(
        <Header {...defaultProps} pageName="Receipts" />,
    )

    expect(
        screen.getByText('RECORA / RECEIPTS'),
    ).toBeInTheDocument()

    expect(
        screen.queryByText('RECORA / HOME'),
    ).not.toBeInTheDocument()
  })

  it('displays login for unauthenticated users', () => {
    render(<Header {...defaultProps} />)

    expect(
        screen.getByRole('button', { name: 'Log in' }),
    ).toBeEnabled()
  })

  it('does not display logout for unauthenticated users', () => {
    render(<Header {...defaultProps} />)

    expect(
        screen.queryByRole('button', { name: 'Log out' }),
    ).not.toBeInTheDocument()
  })

  it('displays logout for authenticated users', () => {
    render(
        <Header {...defaultProps} isAuthenticated />,
    )

    expect(
        screen.getByRole('button', { name: 'Log out' }),
    ).toBeEnabled()
  })

  it('does not display login for authenticated users', () => {
    render(
        <Header {...defaultProps} isAuthenticated />,
    )

    expect(
        screen.queryByRole('button', { name: 'Log in' }),
    ).not.toBeInTheDocument()
  })

  it('displays the authenticated user name', () => {
    render(
        <Header
            {...defaultProps}
            isAuthenticated
            userName="Test User"
        />,
    )

    expect(
        screen.getByText('Test User'),
    ).toBeInTheDocument()
  })

  it('does not display an empty user name', () => {
    const { container } = render(
        <Header
            {...defaultProps}
            isAuthenticated
            userName=""
        />,
    )

    expect(
        container.querySelector('.header-user-name'),
    ).not.toBeInTheDocument()
  })

  it('does not display a whitespace-only user name', () => {
    const { container } = render(
        <Header
            {...defaultProps}
            isAuthenticated
            userName="   "
        />,
    )

    expect(
        container.querySelector('.header-user-name'),
    ).not.toBeInTheDocument()
  })

  it('does not display the user name when unauthenticated', () => {
    render(
        <Header
            {...defaultProps}
            userName="Test User"
        />,
    )

    expect(
        screen.queryByText('Test User'),
    ).not.toBeInTheDocument()
  })

  it('updates the displayed user name', () => {
    const { rerender } = render(
        <Header {...defaultProps} isAuthenticated />,
    )

    rerender(
        <Header
            {...defaultProps}
            isAuthenticated
            userName="Test User"
        />,
    )

    expect(
        screen.getByText('Test User'),
    ).toBeInTheDocument()
  })

  it('calls the login handler when login is clicked', async () => {
    const user = userEvent.setup()

    render(<Header {...defaultProps} />)

    await user.click(
        screen.getByRole('button', { name: 'Log in' }),
    )

    expect(onLoginClick).toHaveBeenCalledTimes(1)
    expect(onLogoutClick).not.toHaveBeenCalled()
  })

  it('calls the logout handler when logout is clicked', async () => {
    const user = userEvent.setup()

    render(
        <Header {...defaultProps} isAuthenticated />,
    )

    await user.click(
        screen.getByRole('button', { name: 'Log out' }),
    )

    expect(onLogoutClick).toHaveBeenCalledTimes(1)
    expect(onLoginClick).not.toHaveBeenCalled()
  })

  it('does not display a create account button', () => {
    render(<Header {...defaultProps} />)

    expect(
        screen.queryByRole('button', {
          name: 'Create account',
        }),
    ).not.toBeInTheDocument()
  })

  it('does not call authentication handlers on render', () => {
    render(<Header {...defaultProps} />)

    expect(onLoginClick).not.toHaveBeenCalled()
    expect(onLogoutClick).not.toHaveBeenCalled()
  })
})