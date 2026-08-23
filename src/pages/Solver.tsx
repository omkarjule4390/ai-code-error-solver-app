import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import CodeEditor from '@/components/CodeEditor'
import ErrorResultCard from '@/components/ErrorResultCard'
import { aiSolverApi } from '@/api/aiSolver'
import { errorReportsApi } from '@/api/errorReports'
import { useAuthStore } from '@/store/authStore'
import type { ErrorReport } from '@/types'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp',
  'go', 'rust', 'php', 'ruby', 'kotlin', 'swift', 'sql',
]

export default function Solver() {
  const user = useAuthStore((s) => s.user)
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ErrorReport | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!code.trim() || !errorMessage.trim()) {
      toast.error('Please provide both the code and the error message')
      return
    }
    if (!user) return
    setLoading(true)
    setResult(null)
    setApiError(null)
    try {
      const analysis = await aiSolverApi.analyze({
        codeSnippet: code,
        errorMessage,
        programmingLanguage: language,
      })
      const saved = await errorReportsApi.create(user.id, {
        codeSnippet: code,
        errorMessage,
        programmingLanguage: language,
        aiAnalysis: analysis,
      })
      setResult(saved)
      setBookmarked(saved.bookmarked)
      toast.success('Analysis completed successfully.')
    } catch {
      setApiError('Unable to analyze the code. Please try again.')
      toast.error('Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async () => {
    if (!result) return
    try {
      await errorReportsApi.setBookmarked(result.id, !bookmarked)
      setBookmarked(!bookmarked)
      toast.success(!bookmarked ? 'Bookmarked!' : 'Bookmark removed')
    } catch {
      toast.error('Could not update bookmark')
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="mb-4">
        <h1 className="fs-2 fw-semibold text-white">Debug with AI</h1>
        <p className="small text-muted-soft mb-0">
          Paste your code and the error you're seeing — get a root cause, a fix, and best practices.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6 d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between">
            <label className="small fw-medium text-white-50 mb-0">Code Snippet</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-select form-select-dark form-select-sm"
              style={{ width: 'auto' }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <CodeEditor value={code} onChange={setCode} language={language} />

          <label className="small fw-medium text-white-50 mb-0">Error Message</label>
          <textarea
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            rows={6}
            placeholder="Paste the full stack trace or error message here..."
            className="form-control form-control-dark rounded-xl p-3 font-monospace small"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn btn-brand w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-stars" />}
            {loading ? 'Analyzing Code...' : '⚡ Analyze Code'}
          </button>
        </div>

        <div className="col-12 col-lg-6">
          <div className="bg-surface rounded-xl p-3 h-100">
            <AnimatePresence mode="wait">
              {apiError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="d-flex flex-column align-items-center justify-content-center text-center gap-3"
                  style={{ minHeight: 300 }}
                >
                  <i className="bi bi-exclamation-circle fs-1" style={{ color: 'var(--severity-high, #fb923c)' }} />
                  <p className="small text-muted-soft mb-0">{apiError}</p>
                  <button onClick={handleAnalyze} className="btn btn-outline-brand btn-sm">
                    <i className="bi bi-arrow-clockwise me-1" />
                    Retry
                  </button>
                </motion.div>
              ) : result ? (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="fs-5 fw-semibold text-white mb-0">Analysis Result</h2>
                    <button onClick={toggleBookmark} className="btn btn-outline-brand btn-sm d-flex align-items-center gap-1">
                      <i className={`bi ${bookmarked ? 'bi-bookmark-check-fill text-brand' : 'bi-bookmark'}`} />
                      {bookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                  </div>
                  <ErrorResultCard
                    analysis={result.aiAnalysis}
                    language={result.programmingLanguage}
                    originalCode={result.codeSnippet}
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="d-flex flex-column align-items-center justify-content-center text-center text-muted-soft"
                  style={{ minHeight: 300 }}
                >
                  <i className="bi bi-stars fs-1 mb-3 opacity-50" />
                  <p className="small mb-0">Your AI-powered analysis will appear here once you submit code and an error.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
