import { useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, MessageSquarePlus, Sparkles } from 'lucide-react'
import ChatMessageBubble from '../components/askAi/ChatMessageBubble'
import type { AskAiRequestHandler, ChatConversation, ChatConversationState } from '../types/askAi'
import './AskAiPage.css'

const suggestedQuestions = [
  'How much did I spend this month?',
  'Which supermarket did I spend the most money at?',
  'Compare my grocery spending over the last three months.',
  'What are my highest spending categories?',
  'How much did I spend at Tesco?',
  'Which was my most expensive purchase this month?',
]

const initialState: ChatConversationState = { messages: [], request: { status: 'idle' } }

interface AskAiPageProps {
  hidden?: boolean
  onRequest?: AskAiRequestHandler
  maxMessageLength?: number
  initialConversation?: ChatConversation
}

function AskAiPage({
  hidden = false,
  onRequest,
  maxMessageLength = 1000,
  initialConversation,
}: AskAiPageProps) {
  const [conversation, setConversation] = useState<ChatConversationState>(() => ({
    ...initialState,
    ...initialConversation,
  }))
  const [draft, setDraft] = useState('')
  const pendingRequest = useRef<AbortController | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagePrefix = useId()
  const messageSequence = useRef(0)
  const question = draft.trim()
  const isTooLong = question.length > maxMessageLength
  const isThinking = conversation.request.status === 'thinking'
  const canSubmit = Boolean(onRequest && question && !isTooLong && !isThinking)

  useEffect(() => {
    return () => {
      const request = pendingRequest.current
      pendingRequest.current = null
      request?.abort()
    }
  }, [])

  useEffect(() => {
    const transcript = transcriptRef.current
    if (transcript && !hidden) {
      transcript.scrollTop = transcript.scrollHeight
    }
  }, [conversation.messages, hidden])

  async function requestAnswer(question: string, retry = false) {
    if (
      !onRequest ||
      pendingRequest.current ||
      !question ||
      (!retry && question.length > maxMessageLength)
    ) {
      return
    }

    const controller = new AbortController()
    pendingRequest.current = controller
    const messageId = `${messagePrefix}-${++messageSequence.current}`
    setConversation((current) => ({
      ...current,
      messages: retry
        ? current.messages
        : [...current.messages, { id: messageId, role: 'user', text: question }],
      request: { status: 'thinking' },
    }))

    if (!retry) {
      setDraft('')
    }
    inputRef.current?.focus()

    try {
      const response = await onRequest({
        conversationId: conversation.id,
        question,
        signal: controller.signal,
      })

      if (pendingRequest.current === controller) {
        setConversation((current) => ({
          id: response.conversationId ?? current.id,
          messages: [
            ...current.messages,
            {
              id: `${messageId}-answer`,
              role: 'assistant',
              text: response.answer,
              receiptReferences: response.receiptReferences,
            },
          ],
          request: { status: 'idle' },
        }))
      }
    } catch {
      if (pendingRequest.current === controller) {
        setConversation((current) => ({ ...current, request: { status: 'failed', question } }))
      }
    } finally {
      if (pendingRequest.current === controller) {
        pendingRequest.current = null
      }
    }
  }

  function startNewConversation() {
    const request = pendingRequest.current
    pendingRequest.current = null
    request?.abort()
    setConversation(initialState)
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <section className="ask-ai-page" aria-labelledby="ask-ai-title" hidden={hidden}>
      <div className="ask-ai-heading">
        <div>
          <h1 id="ask-ai-title">
            Ask Recora <Sparkles size={24} aria-hidden="true" />
          </h1>
          <p>Your personal shopping assistant for receipts and spending.</p>
        </div>
        <button className="ask-ai-secondary" type="button" onClick={startNewConversation}>
          <MessageSquarePlus size={17} aria-hidden="true" />
          New conversation
        </button>
      </div>

      <div className="ask-ai-card">
        <div
          className="ask-ai-transcript"
          ref={transcriptRef}
          role="log"
          aria-label="Conversation"
          tabIndex={0}
        >
          {conversation.messages.length === 0 && (
            <ChatMessageBubble
              message={{
                id: 'welcome',
                role: 'assistant',
                text: 'Hi! What would you like to know about your purchases? Choose a suggested question or write your own.',
              }}
            />
          )}
          {conversation.messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
        </div>

        <div role="status" className="ask-ai-status">
          {!onRequest && 'Ask AI is currently unavailable. You can draft a question here.'}
          {onRequest && isThinking && 'Recora is thinking…'}
        </div>
        {conversation.request.status === 'failed' && (
          <div className="ask-ai-error">
            <span role="alert">Recora couldn’t answer your question. Please try again.</span>
            <button
              className="ask-ai-secondary"
              type="button"
              disabled={!onRequest}
              onClick={() => {
                if (conversation.request.status === 'failed') {
                  void requestAnswer(conversation.request.question, true)
                }
              }}
            >
              Retry
            </button>
          </div>
        )}

        {conversation.messages.length === 0 && (
          <div className="ask-ai-suggestions" role="group" aria-label="Suggested questions">
            {suggestedQuestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setDraft(suggestion)
                  inputRef.current?.focus()
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form
          className="ask-ai-composer"
          onSubmit={(event) => {
            event.preventDefault()
            void requestAnswer(question)
          }}
        >
          <label htmlFor="ask-ai-question">Your question</label>
          <div className="ask-ai-input-row">
            <textarea
              id="ask-ai-question"
              ref={inputRef}
              rows={2}
              placeholder="Ask about your purchases…"
              value={draft}
              aria-describedby="ask-ai-input-help"
              aria-invalid={isTooLong || undefined}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  void requestAnswer(question)
                }
              }}
            />
            <button className="ask-ai-send" type="submit" disabled={!canSubmit}>
              Send <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          </div>
          <div className="ask-ai-input-help" id="ask-ai-input-help">
            <span>
              {isTooLong
                ? `Use ${maxMessageLength} characters or fewer.`
                : 'Shift+Enter adds a new line.'}
            </span>
            <span>
              {question.length} / {maxMessageLength}
            </span>
          </div>
        </form>
      </div>
    </section>
  )
}

export default AskAiPage
