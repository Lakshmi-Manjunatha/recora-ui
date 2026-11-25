import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { AskAiRequestHandler } from './types/askAi'

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

describe('Ask AI navigation', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('opens Ask AI directly in development and keeps the other pages accessible', async () => {
    vi.stubEnv('DEV', true)
    const user = userEvent.setup()
    render(<App />)
    const navigation = within(screen.getByRole('navigation'))

    await user.click(navigation.getByRole('button', { name: 'Ask AI' }))

    expect(screen.getByRole('heading', { name: 'Ask Recora' })).toBeInTheDocument()
    expect(screen.getByText('RECORA / ASK AI')).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: 'Ask AI' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Ask AI is currently unavailable.')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(navigation.getByRole('button', { name: 'Insights' }))
    expect(screen.getByText('RECORA / INSIGHTS')).toBeInTheDocument()
    await user.click(navigation.getByRole('button', { name: 'Receipts' }))
    expect(screen.getByText('RECORA / RECEIPTS')).toBeInTheDocument()
    await user.click(navigation.getByRole('button', { name: 'Home' }))
    expect(screen.getByText('RECORA / HOME')).toBeInTheDocument()
  })

  it('shows the existing login dialog to signed-out users outside development', async () => {
    vi.stubEnv('DEV', false)
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Ask AI' }))

    expect(screen.getByRole('dialog', { name: 'Log in to Recora' })).toBeInTheDocument()
    expect(screen.getByText('RECORA / HOME')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ask Recora' })).not.toBeInTheDocument()
  })

  it('opens for an authenticated session and cancels and clears the conversation on logout', async () => {
    vi.stubEnv('DEV', true)
    const user = userEvent.setup()
    const onAskAi = vi.fn<AskAiRequestHandler>().mockImplementation(() => new Promise(() => {}))
    render(<App onAskAi={onAskAi} />)
    const navigation = within(screen.getByRole('navigation'))

    await user.click(navigation.getByRole('button', { name: 'Receipts' }))
    vi.stubEnv('DEV', false)
    await user.click(navigation.getByRole('button', { name: 'Ask AI' }))
    await user.type(screen.getByRole('textbox', { name: 'Your question' }), 'My spending{Enter}')

    expect(screen.getByText('RECORA / ASK AI')).toBeInTheDocument()
    expect(screen.getByText('My spending')).toBeInTheDocument()
    const { signal } = onAskAi.mock.calls[0][0]
    expect(signal.aborted).toBe(false)

    await user.click(navigation.getByRole('button', { name: 'Insights' }))
    expect(screen.queryByRole('log', { name: 'Conversation' })).not.toBeInTheDocument()
    await user.click(navigation.getByRole('button', { name: 'Ask AI' }))
    expect(
      within(screen.getByRole('log', { name: 'Conversation' })).getByText('My spending'),
    ).toBeInTheDocument()
    expect(signal.aborted).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(signal.aborted).toBe(true)
    expect(screen.getByText('RECORA / HOME')).toBeInTheDocument()
    expect(navigation.getByRole('button', { name: 'Ask AI' })).not.toHaveAttribute('aria-current')
    await user.click(navigation.getByRole('button', { name: 'Ask AI' }))
    expect(screen.getByRole('dialog', { name: 'Log in to Recora' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close login modal' }))
    vi.stubEnv('DEV', true)
    await user.click(navigation.getByRole('button', { name: 'Ask AI' }))

    expect(screen.queryByText('My spending')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Your question' })).toHaveValue('')
  })
})
