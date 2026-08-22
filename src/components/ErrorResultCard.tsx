import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import CodeEditor from '@/components/CodeEditor'
import type { AiAnalysis, Severity } from '@/types'

const severityClass: Record<Severity, string> = {
  LOW: 'badge-severity-LOW',
  MEDIUM: 'badge-severity-MEDIUM',
  HIGH: 'badge-severity-HIGH',
  CRITICAL: 'badge-severity-CRITICAL',
}

export default function ErrorResultCard({ analysis, language }: { analysis: AiAnalysis; language: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="d-flex flex-column gap-3"
    >
      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className={`pill ${severityClass[analysis.severity]}`}>{analysis.severity} severity</span>
        <span className="pill" style={{ border: '1px solid var(--border-800)', color: '#c8c9de' }}>
          <i className="bi bi-speedometer2 me-1" />
          {analysis.confidenceScore}% confidence
        </span>
        {analysis.tokensUsed > 0 && (
          <span className="small text-muted-soft">{analysis.tokensUsed} tokens used</span>
        )}
      </div>

      <Section icon="bi-exclamation-triangle-fill" iconColor="#f87171" title="Root Cause">
        <p className="small text-muted-soft mb-0">{analysis.rootCause}</p>
      </Section>

      <Section icon="bi-lightbulb-fill" iconColor="#fbbf24" title="Explanation">
        <p className="small text-muted-soft mb-0">{analysis.explanation}</p>
      </Section>

      <Section icon="bi-check-circle-fill" iconColor="#34d399" title="Corrected Code">
        <CodeEditor value={analysis.correctedCode} onChange={() => {}} language={language} height="260px" readOnly />
      </Section>

      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <Section icon="bi-journal-bookmark-fill" iconColor="var(--brand-400)" title="Best Practices">
            <ul className="list-unstyled small text-muted-soft mb-0 d-flex flex-column gap-2">
              {analysis.bestPractices.map((tip, i) => (
                <li key={i} className="d-flex gap-2">
                  <span
                    className="mt-2 rounded-circle flex-shrink-0"
                    style={{ width: 6, height: 6, background: 'var(--brand-400)' }}
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </Section>
        </div>
        <div className="col-12 col-sm-6">
          <Section icon="bi-collection-fill" iconColor="var(--purple-600)" title="Related Concepts">
            <div className="d-flex flex-wrap gap-2">
              {analysis.relatedConcepts.map((concept, i) => (
                <span key={i} className="pill" style={{ background: 'var(--bg-950)', color: '#c8c9de' }}>
                  {concept}
                </span>
              ))}
            </div>
          </Section>
        </div>
      </div>
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
    <div className="bg-surface rounded-xl p-3">
      <div className="d-flex align-items-center gap-2 small fw-semibold mb-2">
        <i className={`bi ${icon}`} style={{ color: iconColor }} />
        {title}
      </div>
      {children}
    </div>
  )
}
