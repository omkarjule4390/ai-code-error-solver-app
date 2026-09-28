import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { chatApi } from '@/api/chat'
import type { ChatMessage } from '@/api/chat'

interface DisplayMessage extends ChatMessage {
  id: string
  timestamp: number
}

const SUGGESTIONS: { icon: string; label: string; prompt: string }[] = [
  { icon: '🐛', label: 'Fix my Code', prompt: 'I have a bug in my code. Please find the errors and fix it. Here is my code:\n\n' },
  { icon: '💡', label: 'Explain an Error', prompt: 'Please explain this error message and how to fix it:\n\n' },
  { icon: '☕', label: 'Java Help', prompt: 'I need help with a Java question: ' },
  { icon: '🐍', label: 'Python Help', prompt: 'I need help with a Python question: ' },
  { icon: '🗄️', label: 'SQL Help', prompt: 'I need help writing or fixing a SQL query: ' },
  { icon: '🌐', label: 'Web Development', prompt: 'I need help with a web development (HTML/CSS/JavaScript) question: ' },
]

function copyText(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`✓ ${label} copied successfully`))
    .catch(() => toast.error('Could not copy to clipboard'))
}

// Lightweight markdown renderer (no external library, no innerHTML => XSS-safe):
// fenced code blocks, #/##/### headings, **bold**, `inline code`, "- " lists.
function renderInline(text: string, keyPrefix: string) {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((seg, i) => {
      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
        return (
          <strong key={`${keyPrefix}-b-${i}`} className="text-white">
            {seg.slice(2, -2)}
          </strong>
        )
      }
      if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
        return (
          <code key={`${keyPrefix}-c-${i}`} className="px-1 rounded" style={{ background: 'var(--navy-950)', color: 'var(--cyan-400)' }}>
            {seg.slice(1, -1)}
          </code>
        )
      }
      return <span key={`${keyPrefix}-s-${i}`}>{seg}</span>
    })
}

function renderTextBlock(text: string, key: string) {
  const elements: JSX.Element[] = []
  let list: string[] = []

  const flushList = (idx: number) => {
    if (!list.length) return
    elements.push(
      <ul key={`${key}-ul-${idx}`} className="mb-2 ps-3">
        {list.map((item, i) => (
          <li key={`${key}-li-${idx}-${i}`}>{renderInline(item, `${key}-${idx}-${i}`)}</li>
        ))}
      </ul>,
    )
    list = []
  }

  text.split('\n').forEach((line, idx) => {
    const heading = line.match(/^(#{1,3})\s+(.*)/)
    const bullet = line.match(/^\s*[-*]\s+(.*)/) ?? line.match(/^\s*\d+\.\s+(.*)/)

    if (heading) {
      flushList(idx)
      elements.push(
        <p key={`${key}-h-${idx}`} className="fw-semibold text-white mt-3 mb-1" style={{ fontSize: heading[1].length === 1 ? '1.05rem' : '0.95rem' }}>
          {renderInline(heading[2], `${key}-h-${idx}`)}
        </p>,
      )
    } else if (bullet) {
      list.push(bullet[1])
    } else if (line.trim() === '') {
      flushList(idx)
    } else {
      flushList(idx)
      elements.push(
        <p key={`${key}-p-${idx}`} className="mb-1">
          {renderInline(line, `${key}-p-${idx}`)}
        </p>,
      )
    }
  })
  flushList(9999)
  return elements
}

function renderContent(content: string) {
  const parts = content.split(/```([\w+#-]*)\n([\s\S]*?)```/g)
  const nodes: JSX.Element[] = []

  for (let i = 0; i < parts.length; i += 3) {
    const text = parts[i]
    if (text && text.trim()) nodes.push(<div key={`t-${i}`}>{renderTextBlock(text, `t-${i}`)}</div>)

    const lang = parts[i + 1]
    const code = parts[i + 2]
    if (code !== undefined) {
      nodes.push(
        <div key={`c-${i}`} className="position-relative my-2">
          <div className="d-flex align-items-center justify-content-between px-3 py-1" style={{ background: 'var(--navy-800)', borderRadius: '0.75rem 0.75rem 0 0', border: '1px solid var(--border-800)', borderBottom: 0 }}>
            <span className="small text-muted-soft">{lang || 'code'}</span>
            <button onClick={() => copyText(code.trim(), 'Code')} className="btn btn-sm text-muted-soft p-0" aria-label="Copy code">
              <i className="bi bi-clipboard me-1" />
              Copy Code
            </button>
          </div>
          <pre className="stack-trace-box p-3 mb-0" style={{ overflowX: 'auto', fontSize: '0.8rem', borderRadius: '0 0 0.75rem 0.75rem' }}>
            <code>{code.trim()}</code>
          </pre>
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
  const [failedText, setFailedText] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, failedText])

  const requestReply = async (history: DisplayMessage[]) => {
    setLoading(true)
    setFailedText(null)
    try {
      const reply = await chatApi.send(history.map(({ role, content }) => ({ role, content })))
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: Date.now() }])
    } catch {
      setFailedText('Something went wrong while contacting the AI assistant.')
      toast.error('Could not reach the AI assistant.')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg: DisplayMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    await requestReply(next)
  }

  const handleRetry = () => {
    if (!loading && messages.length) requestReply(messages)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="container py-4 d-flex flex-column" style={{ maxWidth: 900, minHeight: 'calc(100vh - 72px)' }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="fs-2 fw-semibold text-white mb-0">AI Coding Assistant</h1>
          <p className="small text-muted-soft mb-0">Debug code, explain errors, learn programming.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); setFailedText(null) }} className="btn btn-outline-brand btn-sm">
            <i className="bi bi-trash3 me-1" />
            Clear Chat
          </button>
        )}
      </div>

      <div className="bg-surface rounded-xl p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 460 }}>
        <div className="flex-grow-1 overflow-auto d-flex flex-column gap-3 mb-3" style={{ maxHeight: '58vh' }}>
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex flex-column align-items-center justify-content-center text-center flex-grow-1 gap-3">
              <div>
                <p className="fs-5 fw-semibold text-white mb-1">👋 Welcome to AI Coding Assistant</p>
                <p className="small text-muted-soft mb-0">Ask me anything about programming, debugging, errors, code or development.</p>
              </div>
              <div className="d-flex flex-wrap justify-content-center gap-2" style={{ maxWidth: 560 }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => { setInput(s.prompt); inputRef.current?.focus() }}
                    className="btn btn-outline-brand btn-sm"
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`d-flex ${m.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              <div
                className="rounded-xl p-3"
                style={{ maxWidth: '88%', background: m.role === 'user' ? 'var(--navy-800)' : 'var(--navy-950)', border: '1px solid var(--border-800)' }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: 24, height: 24, background: 'rgba(255,107,74,0.15)', color: 'var(--cyan-400)' }}
                  >
                    <i className={`bi ${m.role === 'user' ? 'bi-person-fill' : 'bi-robot'}`} style={{ fontSize: '0.75rem' }} />
                  </span>
                  <span className="small fw-semibold text-white">{m.role === 'user' ? 'You' : 'AI Assistant'}</span>
                  <span className="text-muted-soft" style={{ fontSize: '0.7rem' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {m.role === 'assistant' && (
                    <button onClick={() => copyText(m.content, 'Response')} className="btn btn-sm text-muted-soft ms-auto p-0 px-1" aria-label="Copy response" title="Copy response">
                      <i className="bi bi-clipboard" />
                    </button>
                  )}
                </div>
                <div className="small text-muted-soft" style={{ overflowWrap: 'anywhere' }}>{renderContent(m.content)}</div>
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

          {failedText && !loading && (
            <div className="d-flex justify-content-start">
              <div className="rounded-xl p-3 d-flex flex-wrap align-items-center gap-2" style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
                <i className="bi bi-exclamation-circle" style={{ color: 'var(--severity-critical)' }} />
                <span className="small text-muted-soft">{failedText}</span>
                <button onClick={handleRetry} className="btn btn-outline-brand btn-sm">
                  <i className="bi bi-arrow-clockwise me-1" />
                  Retry
                </button>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="d-flex gap-2 align-items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type your question... (Enter to send, Shift+Enter for new line)"
            className="form-control form-control-dark rounded-xl p-2 small"
            style={{ resize: 'none' }}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="btn btn-brand px-3 py-2 d-flex align-items-center justify-content-center" aria-label="Send message">
            <i className="bi bi-send-fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
