import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="container py-5 text-center" style={{ maxWidth: 900 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span
          className="d-inline-flex align-items-center gap-2 pill mb-3"
          style={{ background: 'rgba(109,117,245,0.1)', color: 'var(--brand-400)', border: '1px solid rgba(109,117,245,0.3)' }}
        >
          <i className="bi bi-stars" /> AI-powered debugging
        </span>
        <h1 className="display-4 fw-bold">
          Stop staring at <span className="text-brand">stack traces.</span>
        </h1>
        <p className="mx-auto mt-3 text-muted-soft fs-5" style={{ maxWidth: 640 }}>
          Paste your code and the error message. Get the root cause, a corrected fix, and best practices — in
          seconds.
        </p>
        <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
          <Link to={isAuthenticated ? '/solver' : '/register'} className="btn btn-brand px-4 py-2 fw-semibold">
            {isAuthenticated ? 'Start solving' : 'Get started free'} <i className="bi bi-arrow-right ms-1" />
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-outline-brand px-4 py-2">
              Log in
            </Link>
          )}
        </div>
      </motion.div>

      <div className="row g-4 mt-5 text-start">
        <div className="col-12 col-sm-4">
          <Feature icon="bi-lightning-charge-fill" iconColor="#fbbf24" title="Instant root-cause analysis">
            AI reads your code and error together, pinpointing exactly what went wrong.
          </Feature>
        </div>
        <div className="col-12 col-sm-4">
          <Feature icon="bi-stars" iconColor="var(--brand-400)" title="Corrected code, ready to use">
            Get a working fix side-by-side with your original snippet.
          </Feature>
        </div>
        <div className="col-12 col-sm-4">
          <Feature icon="bi-shield-check" iconColor="#34d399" title="Learn best practices">
            Every analysis includes tips so you avoid the same bug twice.
          </Feature>
        </div>
      </div>
    </div>
  )
}

function Feature({
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
    <div className="bg-surface rounded-xl p-4 h-100">
      <i className={`bi ${icon} fs-3 mb-2 d-block`} style={{ color: iconColor }} />
      <h3 className="fs-6 fw-semibold text-white">{title}</h3>
      <p className="small text-muted-soft mb-0">{children}</p>
    </div>
  )
}
