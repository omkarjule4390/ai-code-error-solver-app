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
          style={{ background: 'rgba(25,211,197,0.1)', color: 'var(--cyan-400)', border: '1px solid rgba(25,211,197,0.3)' }}
        >
          <i className="bi bi-cpu" /> AI Developer Laboratory
        </span>
        <h1 className="display-4 fw-bold">
          AI Code <span className="text-brand">Error Solver</span>
        </h1>
        <p className="fs-5 fw-semibold mt-2 mb-0" style={{ color: 'var(--mint-300)' }}>
          Find. Understand. Fix. Learn.
        </p>
        <p className="mx-auto mt-3 text-muted-soft fs-6" style={{ maxWidth: 640 }}>
          An intelligent coding assistant that detects errors, explains the root cause, and generates reliable
          corrected code.
        </p>
        <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
          <Link to={isAuthenticated ? '/solver' : '/register'} className="btn btn-brand px-4 py-2 fw-semibold">
            <i className="bi bi-lightning-charge-fill me-1" />
            Analyze My Code
          </Link>
          <a href="#features" className="btn btn-outline-brand px-4 py-2">
            Explore Features
          </a>
        </div>
      </motion.div>

      <div id="features" className="row g-4 mt-5 text-start">
        <div className="col-12 col-sm-4">
          <Feature icon="bi-lightning-charge-fill" iconColor="#fbbf24" title="Instant root-cause analysis">
            AI reads your code and error together, pinpointing exactly what went wrong.
          </Feature>
        </div>
        <div className="col-12 col-sm-4">
          <Feature icon="bi-stars" iconColor="var(--cyan-400)" title="Corrected code, ready to use">
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
