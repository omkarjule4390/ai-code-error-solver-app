import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { chatApi } from '@/api/chat'
import type { ChatMessage } from '@/api/chat'

interface DisplayMessage extends ChatMessage {
  id: string
  timestamp: number
}

function renderContent(content: string, onCopy: (text: string) => void) {
  // Split on fenced code blocks ```lang\n...\n``` and render each part.
  const parts = content.split(/```(\w*)\n([\s\S]*?)```/g)
  const nodes: JSX.Element[] = []

  for (let i = 0; i < parts.length; i += 3) {
    const text = parts[i]
    if (text) {
      nodes.push(
        <p key={`t-${i}`} className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
          {text.trim()}
        </p>,
      )
    }
    const lang = parts[i + 1]
    const code = parts[i + 2]
    if (code !== undefined) {
      nodes.push(
        <div key={`c-${i}`} className="position-relative mb-2">
          <pre
            className="stack-trace-box p-3 mb-0"
            style={{ overflowX: 'auto', fontSize: '0.8rem' }}
          >
            <code>{code.trim()}</code>
          </pre>
          <button
            onClick={() => onCopy(code.trim())}
            className="btn btn-sm btn-outline-brand position-absolute"
            style={{ top: 8, right: 8 }}
            aria-label="Copy code"
          >
            <i className="bi bi-clipboard" />
          </button>
          {lang && (
            <span className="small text-muted-soft position-absolute" style={{ top: 10, left: 14 }}>
              {lang}
            </span>
          )}
        </div>,
      )
    }
  }

  return nodes
}

export default function ChatBox() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const reply = await chatApi.send(nextMessages.map(({ role, content }) => ({ role, content })))
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: Date.now() },
      ])
    } catch {
      toast.error('Could not reach the AI assistant. Please try again.')
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I could not process that. Please try again.',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([])
  }

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('✓ Code copied successfully'))
      .catch(() => toast.error('Could not copy to clipboard'))
  }

  return (
    <div className="container py-4 d-flex flex-column" style={{ maxWidth: 900, minHeight: 'calc(100vh - 72px)' }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="fs-2 fw-semibold text-white mb-0">AI Chat</h1>
          <p className="small text-muted-soft mb-0">Ask about your code, an error, or any programming concept.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} className="btn btn-outline-brand btn-sm">
            <i className="bi bi-trash3 me-1" />
            Clear Chat
          </button>
        )}
      </div>

      <div className="bg-surface rounded-xl p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 420 }}>
        <div className="flex-grow-1 overflow-auto d-flex flex-column gap-3 mb-3" style={{ maxHeight: '55vh' }}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="d-flex flex-column align-items-center justify-content-center text-center text-muted-soft flex-grow-1"
            >
              <i className="bi bi-chat-dots fs-1 mb-3 opacity-50" />
              <p className="small mb-1">Welcome! Ask me anything about your code.</p>
              <p className="small mb-0">
                e.g. "Explain this Python function" or "Why does my Java code throw NullPointerException?"
              </p>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`d-flex ${m.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className="rounded-xl p-3"
                style={{
                  maxWidth: '85%',
                  background: m.role === 'user' ? 'var(--navy-800)' : 'var(--navy-950)',
                  border: '1px solid var(--border-800)',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className={`bi ${m.role === 'user' ? 'bi-person-circle' : 'bi-robot'}`} style={{ color: 'var(--cyan-400)' }} />
                  <span className="small fw-semibold text-white">{m.role === 'user' ? 'You' : 'AI Assistant'}</span>
                  <span className="text-muted-soft" style={{ fontSize: '0.7rem' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="small text-muted-soft">{renderContent(m.content, handleCopy)}</div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="d-flex justify-content-start">
              <div className="rounded-xl p-3 d-flex align-items-center gap-2" style={{ border: '1px solid var(--border-800)' }}>
                <span className="spinner-border spinner-border-sm" style={{ color: 'var(--cyan-400)' }} />
                <span className="small text-muted-soft">AI is typing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="d-flex gap-2 align-items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type your question... (Enter to send, Shift+Enter for new line)"
            className="form-control form-control-dark rounded-xl p-2 small"
            style={{ resize: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn btn-brand px-3 py-2 d-flex align-items-center justify-content-center"
            aria-label="Send message"
          >
            <i className="bi bi-send-fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
