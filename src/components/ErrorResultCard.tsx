import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import type { ReactNode } from 'react'
import CodeEditor from '@/components/CodeEditor'
import { formatConfidence } from '@/utils/format'
import type { AiAnalysis, Severity } from '@/types'

const severityClass: Record<Severity, string> = {
  LOW: 'badge-severity-LOW',
  MEDIUM: 'badge-severity-MEDIUM',
  HIGH: 'badge-severity-HIGH',
  CRITICAL: 'badge-severity-CRITICAL',
}

function copyText(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`✓ ${label} copied successfully`))
    .catch(() => toast.error('Could not copy to clipboard'))
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  toast.success('✓ Code downloaded successfully')
}

export default function ErrorResultCard({
  analysis,
  language,
  originalCode,
}: {
  analysis: AiAnalysis
  language: string
  originalCode: string
}) {
  const [showStack, setShowStack] = useState(false)
  const [view, setView] = useState<'original' | 'corrected'>('corrected')

  const ext: Record<string, string> = {
    python: 'py', javascript: 'js', typescript: 'ts', java: 'java', csharp: 'cs',
    cpp: 'cpp', c: 'c', go: 'go', rust: 'rs', php: 'php', ruby: 'rb',
    kotlin: 'kt', swift: 'swift', sql: 'sql', html: 'html', css: 'css',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="d-flex flex-column gap-3"
    >
      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className="small text-muted-soft fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
          <i className="bi bi-exclamation-octagon-fill me-1" style={{ color: 'var(--cyan-400)' }} />
          Error Detected
        </span>
      </div>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className={`pill ${severityClass[analysis.severity]}`}>{analysis.severity} SEVERITY</span>
        <span className="pill" style={{ border: '1px solid var(--border-800)', color: '#cfe3f0' }}>
          <i className="bi bi-speedometer2 me-1" />
          {formatConfidence(analysis.confidenceScore)} Confidence
        </span>
        {analysis.tokensUsed > 0 && (
          <span className="small text-muted-soft ms-auto">{analysis.tokensUsed} tokens used</span>
        )}
      </div>

      <div className="row g-3">
        <div className="col-6">
          <Section icon="bi-tag-fill" iconColor="var(--cyan-400)" title="Error Type">
            <p className="small text-muted-soft mb-0">{analysis.errorType || 'Unknown'}</p>
          </Section>
        </div>
        <div className="col-6">
          <Section icon="bi-geo-alt-fill" iconColor="var(--mint-300)" title="Error Location">
            <p className="small text-muted-soft mb-0">
              {analysis.fileName ? `${analysis.fileName} ` : ''}
              {analysis.lineNumber ? `Line ${analysis.lineNumber}` : 'Not specified'}
            </p>
          </Section>
        </div>
      </div>

      <Section icon="bi-exclamation-triangle-fill" iconColor="#f87171" title="Root Cause">
        <p className="small text-muted-soft mb-0">{analysis.rootCause}</p>
      </Section>

      <Section icon="bi-lightbulb-fill" iconColor="var(--mint-300)" title="Explanation">
        <p className="small text-muted-soft mb-0">{analysis.explanation}</p>
      </Section>

      {analysis.originalError && (
        <div className="bg-surface rounded-xl p-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2 small fw-semibold">
              <i className="bi bi-terminal-fill" style={{ color: 'var(--cyan-400)' }} />
              Original Error / Stack Trace
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-brand"
                onClick={() => copyText(analysis.originalError, 'Error message')}
                aria-label="Copy stack trace"
              >
                <i className="bi bi-clipboard" />
              </button>
              <button
                className="btn btn-sm btn-outline-brand"
                onClick={() => setShowStack((s) => !s)}
              >
                <i className={`bi ${showStack ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
              </button>
            </div>
          </div>
          {showStack && <div className="stack-trace-box p-3">{analysis.originalError}</div>}
        </div>
      )}

      <div className="bg-surface rounded-xl p-3">
        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 small fw-semibold">
            <i className="bi bi-check-circle-fill" style={{ color: 'var(--mint-300)' }} />
            {view === 'corrected' ? 'Corrected Code' : 'Original Code'}
          </div>
          <div className="d-flex align-items-center gap-2 code-toggle">
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${view === 'original' ? 'btn-brand' : 'btn-outline-brand'}`}
                onClick={() => setView('original')}
              >
                Original
              </button>
              <button
                className={`btn ${view === 'corrected' ? 'btn-brand' : 'btn-outline-brand'}`}
                onClick={() => setView('corrected')}
              >
                Corrected
              </button>
            </div>
            <button
              className="btn btn-sm btn-outline-brand"
              onClick={() => copyText(view === 'corrected' ? analysis.correctedCode : originalCode, 'Corrected code')}
            >
              <i className="bi bi-clipboard me-1" />
              Copy
            </button>
            <button
              className="btn btn-sm btn-outline-brand"
              onClick={() =>
                downloadText(
                  view === 'corrected' ? analysis.correctedCode : originalCode,
                  `fixed.${ext[language] ?? 'txt'}`,
                )
              }
            >
              <i className="bi bi-download me-1" />
              Download
            </button>
          </div>
        </div>
        <CodeEditor
          value={view === 'corrected' ? analysis.correctedCode : originalCode}
          onChange={() => {}}
          language={language}
          height="260px"
          readOnly
        />
      </div>

      {analysis.solutions?.length > 1 && (
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-2 small fw-semibold">
            <i className="bi bi-layers-fill" style={{ color: 'var(--cyan-400)' }} />
            Alternative Fixes
          </div>
          {analysis.solutions.map((sol, i) => (
            <div key={i} className="bg-surface rounded-xl p-3">
              <p className="fw-semibold small text-white mb-1">{sol.title}</p>
              <p className="small text-muted-soft mb-2">{sol.description}</p>
              {sol.whenToUse && (
                <p className="small mb-2" style={{ color: 'var(--mint-300)' }}>
                  <i className="bi bi-info-circle me-1" />
                  When to use: {sol.whenToUse}
                </p>
              )}
              <CodeEditor value={sol.code} onChange={() => {}} language={language} height="140px" readOnly />
            </div>
          ))}
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <Section icon="bi-award-fill" iconColor="var(--mint-300)" title="Best Recommendation">
            <p className="small text-muted-soft mb-0">{analysis.bestRecommendation}</p>
          </Section>
        </div>
        <div className="col-12 col-sm-6">
          <Section icon="bi-shield-check" iconColor="var(--cyan-400)" title="Prevention Tip">
            <p className="small text-muted-soft mb-0">{analysis.preventionTip}</p>
          </Section>
        </div>
      </div>

      {(analysis.bestPractices?.length > 0 || analysis.relatedConcepts?.length > 0) && (
        <div className="row g-3">
          {analysis.bestPractices?.length > 0 && (
            <div className="col-12 col-sm-6">
              <Section icon="bi-journal-bookmark-fill" iconColor="var(--cyan-400)" title="Best Practices">
                <ul className="list-unstyled small text-muted-soft mb-0 d-flex flex-column gap-2">
                  {analysis.bestPractices.map((tip, i) => (
                    <li key={i} className="d-flex gap-2">
                      <span
                        className="mt-2 rounded-circle flex-shrink-0"
                        style={{ width: 6, height: 6, background: 'var(--cyan-400)' }}
                      />
                      {tip}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          )}
          {analysis.relatedConcepts?.length > 0 && (
            <div className="col-12 col-sm-6">
              <Section icon="bi-collection-fill" iconColor="var(--mint-300)" title="Related Concepts">
                <div className="d-flex flex-wrap gap-2">
                  {analysis.relatedConcepts.map((concept, i) => (
                    <span key={i} className="pill" style={{ background: 'var(--navy-950)', color: '#cfe3f0' }}>
                      {concept}
                    </span>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function Section({
  icon,
  iconColor,
  title,
  children,
}: {
  icon: string
  iconColor: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="bg-surface rounded-xl p-3 h-100">
      <div className="d-flex align-items-center gap-2 small fw-semibold mb-2">
        <i className={`bi ${icon}`} style={{ color: iconColor }} />
        {title}
      </div>
      {children}
    </div>
  )
}
