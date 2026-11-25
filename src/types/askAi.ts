export interface ChatReceiptReference {
  receiptId: string
  label: string
}

export type ChatMessage = { id: string; text: string } & (
  { role: 'user' } | { role: 'assistant'; receiptReferences?: readonly ChatReceiptReference[] }
)

export interface ChatConversation {
  id?: string
  messages: readonly ChatMessage[]
}

export interface ChatConversationState extends ChatConversation {
  request: { status: 'idle' } | { status: 'thinking' } | { status: 'failed'; question: string }
}

export interface AskAiRequest {
  conversationId?: string
  question: string
  signal: AbortSignal
}

export interface AskAiResponse {
  conversationId?: string
  answer: string
  receiptReferences?: readonly ChatReceiptReference[]
}

// UI adapter boundary. A future HTTP client can map its DTOs to these types.
export type AskAiRequestHandler = (request: AskAiRequest) => Promise<AskAiResponse>
