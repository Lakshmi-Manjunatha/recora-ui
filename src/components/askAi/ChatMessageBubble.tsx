import type { ChatMessage } from '../../types/askAi'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const references = message.role === 'assistant' ? message.receiptReferences : undefined

  return (
    <article className={`ask-ai-bubble ask-ai-bubble--${message.role}`}>
      <div className="ask-ai-sender">{message.role === 'user' ? 'You' : 'Recora'}</div>
      <div className="ask-ai-message-text">{message.text}</div>
      {references && references.length > 0 && (
        <div className="ask-ai-references">
          <strong>Referenced receipts</strong>
          <ul>
            {references.map(({ receiptId, label }) => (
              <li key={receiptId}>{label}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

export default ChatMessageBubble
