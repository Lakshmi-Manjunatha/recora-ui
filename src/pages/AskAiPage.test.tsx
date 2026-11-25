import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AskAiRequestHandler, AskAiResponse } from '../types/askAi'
import AskAiPage from './AskAiPage'

function getComposer() {
  return {
    input: screen.getByRole('textbox', { name: 'Your question' }),
    send: screen.getByRole('button', { name: 'Send' }),
  }
}

function getTranscript() {
  return screen.getByRole('log', { name: 'Conversation' })
}

function deferredAnswer() {
  let resolve!: (response: AskAiResponse) => void
  const promise = new Promise<AskAiResponse>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe('AskAiPage', () => {
  it('renders the heading, welcome message, six suggestions and conversation controls', () => {
    render(<AskAiPage />)

    expect(screen.getByRole('heading', { name: 'Ask Recora' })).toBeInTheDocument()
    expect(
      screen.getByText('Your personal shopping assistant for receipts and spending.'),
    ).toBeInTheDocument()
    expect(
      within(getTranscript()).getByText(/^Hi! What would you like to know/),
    ).toBeInTheDocument()
    const suggestions = within(screen.getByRole('group', { name: 'Suggested questions' }))
    expect(suggestions.getAllByRole('button')).toHaveLength(6)
    expect(
      suggestions.getByRole('button', { name: 'How much did I spend this month?' }),
    ).toBeEnabled()
    expect(screen.getByRole('button', { name: 'New conversation' })).toBeEnabled()
    expect(getComposer().input).toBeEnabled()
    expect(getComposer().send).toBeDisabled()
  })

  it('allows drafting when the handler is unavailable and disables submission', async () => {
    const user = userEvent.setup()
    render(<AskAiPage />)
    const { input, send } = getComposer()

    await user.type(input, 'My spending{Enter}')

    expect(screen.getByRole('status')).toHaveTextContent('Ask AI is currently unavailable.')
    expect(input).toHaveValue('My spending')
    expect(send).toBeDisabled()
    expect(within(getTranscript()).queryByText('My spending')).not.toBeInTheDocument()
  })

  it('rejects empty, whitespace-only, and over-limit questions including keyboard submission', async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn<AskAiRequestHandler>()
    render(<AskAiPage onRequest={onRequest} maxMessageLength={5} />)
    const { input, send } = getComposer()

    expect(send).toBeDisabled()
    await user.type(input, '{Enter}   {Enter}')
    expect(send).toBeDisabled()
    await user.type(input, 'abcdef{Enter}')
    expect(send).toBeDisabled()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Use 5 characters or fewer. 6 / 5')
    expect(onRequest).not.toHaveBeenCalled()

    await user.keyboard('{Backspace}')
    expect(send).toBeEnabled()
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('focuses the input on a suggestion and sends it only after confirmation', async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn<AskAiRequestHandler>().mockResolvedValue({ answer: 'Test answer.' })
    render(<AskAiPage onRequest={onRequest} />)
    const { input, send } = getComposer()
    const question = 'How much did I spend this month?'

    await user.click(screen.getByRole('button', { name: question }))

    expect(input).toHaveValue(question)
    expect(input).toHaveFocus()
    expect(onRequest).not.toHaveBeenCalled()
    await user.click(send)

    expect(onRequest).toHaveBeenCalledExactlyOnceWith({
      question,
      conversationId: undefined,
      signal: expect.any(AbortSignal),
    })
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(await screen.findByText('Test answer.')).toBeInTheDocument()
  })

  it('inserts a newline with Shift+Enter and trims the message on Enter', async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn<AskAiRequestHandler>().mockResolvedValue({ answer: 'Answer.' })
    render(<AskAiPage onRequest={onRequest} />)
    const { input } = getComposer()

    await user.type(input, '  First line{Shift>}{Enter}{/Shift}Second line  ')

    expect(input).toHaveValue('  First line\nSecond line  ')
    expect(onRequest).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')

    expect(onRequest).toHaveBeenCalledTimes(1)
    expect(onRequest.mock.calls[0][0].question).toBe('First line\nSecond line')
    expect(input).toHaveValue('')
    expect(await screen.findByText('Answer.')).toBeInTheDocument()
  })

  it('leaves Enter to the input method when a composition is active', () => {
    const onRequest = vi.fn<AskAiRequestHandler>()
    render(<AskAiPage onRequest={onRequest} />)
    const { input } = getComposer()
    fireEvent.change(input, { target: { value: 'Question' } })

    expect(fireEvent.keyDown(input, { key: 'Enter', isComposing: true })).toBe(true)
    expect(onRequest).not.toHaveBeenCalled()
  })

  it('announces thinking, prevents a second submission, and scrolls as messages arrive', async () => {
    const user = userEvent.setup()
    const pending = deferredAnswer()
    const onRequest = vi.fn<AskAiRequestHandler>().mockReturnValue(pending.promise)
    render(<AskAiPage onRequest={onRequest} />)
    const { input, send } = getComposer()
    const transcript = getTranscript()
    Object.defineProperty(transcript, 'scrollHeight', { configurable: true, value: 700 })

    await user.type(input, 'First question{Enter}')

    expect(screen.getByRole('status')).toHaveTextContent('Recora is thinking')
    expect(within(transcript).getByText('First question')).toBeInTheDocument()
    expect(send).toBeDisabled()
    expect(transcript.scrollTop).toBe(700)
    await user.type(input, 'Second question{Enter}')
    expect(onRequest).toHaveBeenCalledTimes(1)
    expect(input).toHaveValue('Second question')

    transcript.scrollTop = 0
    await act(() => pending.resolve({ answer: 'First answer' }))

    expect(within(transcript).getByText('First answer')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(transcript.scrollTop).toBe(700)
    expect(send).toBeEnabled()
  })

  it('renders ordered conversation history and uses the returned ID for follow-up requests', async () => {
    const user = userEvent.setup()
    const onRequest = vi
      .fn<AskAiRequestHandler>()
      .mockResolvedValueOnce({
        conversationId: 'server-thread',
        answer: 'First answer',
        receiptReferences: [{ receiptId: 'receipt-1', label: 'Market receipt' }],
      })
      .mockResolvedValueOnce({ answer: 'Second answer' })
    render(
      <AskAiPage
        onRequest={onRequest}
        initialConversation={{
          id: 'existing-thread',
          messages: [
            { id: 'prior-question', role: 'user', text: 'Earlier question' },
            { id: 'prior-answer', role: 'assistant', text: 'Earlier answer' },
          ],
        }}
      />,
    )
    const { input } = getComposer()

    await user.type(input, 'First question{Enter}')
    expect(await screen.findByText('First answer')).toBeInTheDocument()
    await user.type(input, 'Second question{Enter}')
    expect(await screen.findByText('Second answer')).toBeInTheDocument()

    expect(onRequest.mock.calls.map(([request]) => request.conversationId)).toEqual([
      'existing-thread',
      'server-thread',
    ])
    expect(
      within(getTranscript())
        .getAllByRole('article')
        .map((message) => message.textContent),
    ).toEqual([
      'YouEarlier question',
      'RecoraEarlier answer',
      'YouFirst question',
      'RecoraFirst answerReferenced receiptsMarket receipt',
      'YouSecond question',
      'RecoraSecond answer',
    ])
    expect(within(getTranscript()).getByRole('listitem')).toHaveTextContent('Market receipt')
  })

  it('preserves earlier messages after failure and retries without duplicating the failed question', async () => {
    const user = userEvent.setup()
    const onRequest = vi
      .fn<AskAiRequestHandler>()
      .mockResolvedValueOnce({ conversationId: 'thread', answer: 'Earlier answer' })
      .mockRejectedValueOnce(new Error('Internal service details'))
      .mockResolvedValueOnce({ answer: 'Retried answer' })
    render(<AskAiPage onRequest={onRequest} />)
    const { input } = getComposer()

    await user.type(input, 'Earlier question{Enter}')
    expect(await screen.findByText('Earlier answer')).toBeInTheDocument()
    await user.type(input, 'Failed question{Enter}')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Recora couldn’t answer your question.',
    )
    expect(screen.queryByText('Internal service details')).not.toBeInTheDocument()
    expect(screen.getByText('Earlier question')).toBeInTheDocument()
    expect(screen.getByText('Earlier answer')).toBeInTheDocument()
    expect(screen.getByText('Failed question')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Retried answer')).toBeInTheDocument()
    expect(onRequest).toHaveBeenCalledTimes(3)
    expect(onRequest.mock.calls[2][0]).toMatchObject({
      question: 'Failed question',
      conversationId: 'thread',
    })
    expect(onRequest.mock.calls[2][0].signal).not.toBe(onRequest.mock.calls[1][0].signal)
    expect(screen.getAllByText('Failed question')).toHaveLength(1)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('clears history, draft, and conversation ID when starting a new conversation', async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn<AskAiRequestHandler>().mockResolvedValue({ answer: 'Answer' })
    render(
      <AskAiPage
        onRequest={onRequest}
        initialConversation={{ id: 'prior-thread', messages: [] }}
      />,
    )
    const { input } = getComposer()
    await user.type(input, 'Question{Enter}Unsent draft')
    expect(await screen.findByText('Answer')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New conversation' }))

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(screen.queryByText('Question', { selector: 'article div' })).not.toBeInTheDocument()
    expect(screen.queryByText('Answer')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Suggested questions' })).toBeInTheDocument()
    await user.type(input, 'New question{Enter}')
    expect(onRequest.mock.calls[1][0].conversationId).toBeUndefined()
  })

  it('aborts a pending request on reset and ignores a late response while the new request runs', async () => {
    const user = userEvent.setup()
    const first = deferredAnswer()
    const second = deferredAnswer()
    const onRequest = vi
      .fn<AskAiRequestHandler>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    render(<AskAiPage onRequest={onRequest} />)
    const { input } = getComposer()
    await user.type(input, 'Old question{Enter}')

    await user.click(screen.getByRole('button', { name: 'New conversation' }))

    expect(onRequest.mock.calls[0][0].signal.aborted).toBe(true)
    await user.type(input, 'New question{Enter}')
    await act(() => first.resolve({ answer: 'Stale answer', conversationId: 'old-thread' }))

    expect(screen.queryByText('Stale answer')).not.toBeInTheDocument()
    expect(screen.queryByText('Old question')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Recora is thinking')
    expect(onRequest.mock.calls[1][0].signal.aborted).toBe(false)
    await act(() => second.resolve({ answer: 'New answer' }))
    expect(screen.getByText('New answer')).toBeInTheDocument()
  })

  it('preserves line breaks and renders script and event-handler markup as literal text', async () => {
    const user = userEvent.setup()
    const answer =
      'First line\n<script>document.body.dataset.executed = "script"</script>\n<img src="x" onerror="document.body.dataset.executed = \'event\'">'
    const onRequest = vi.fn<AskAiRequestHandler>().mockResolvedValue({ answer })
    render(<AskAiPage onRequest={onRequest} />)

    await user.type(getComposer().input, 'Question{Enter}')

    const transcript = getTranscript()
    const response = await within(transcript).findByText(answer, { normalizer: (text) => text })
    expect(response.textContent).toBe(answer)
    expect(transcript.querySelector('script, img, [onerror]')).toBeNull()
    expect(document.body).not.toHaveAttribute('data-executed')
  })
})
