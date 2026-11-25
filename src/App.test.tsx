import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('Insights navigation', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('opens Insights directly in development and lets the user return to Receipts', async () => {
    vi.stubEnv('DEV', true)
    const user = userEvent.setup()
    render(<App />)
    const navigation = within(screen.getByRole('navigation'))
    const insights = navigation.getByRole('button', { name: 'Insights' })

    await user.click(insights)

    expect(screen.getByRole('heading', { name: 'Shopping insights' })).toBeInTheDocument()
    expect(screen.getByText('RECORA / INSIGHTS')).toBeInTheDocument()
    expect(insights).toHaveClass('active')
    expect(insights).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Add receipts to see your spending.')

    await user.click(navigation.getByRole('button', { name: 'Receipts' }))

    expect(screen.getByText('RECORA / RECEIPTS')).toBeInTheDocument()
    expect(insights).not.toHaveClass('active')
  })

  it('opens Insights for an authenticated session and requires login again after logout', async () => {
    vi.stubEnv('DEV', true)
    const user = userEvent.setup()
    render(<App />)
    const navigation = within(screen.getByRole('navigation'))
    const insights = navigation.getByRole('button', { name: 'Insights' })

    await user.click(navigation.getByRole('button', { name: 'Receipts' }))
    vi.stubEnv('DEV', false)
    await user.click(insights)

    expect(screen.getByText('RECORA / INSIGHTS')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(screen.getByText('RECORA / HOME')).toBeInTheDocument()
    expect(insights).not.toHaveAttribute('aria-current')

    await user.click(insights)

    expect(screen.getByRole('dialog', { name: 'Log in to Recora' })).toBeInTheDocument()
  })

  it('uses the same sign-in requirement as Receipts outside development', async () => {
    vi.stubEnv('DEV', false)
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Insights' }))

    expect(screen.getByRole('dialog', { name: 'Log in to Recora' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Shopping insights' })).not.toBeInTheDocument()
  })
})
