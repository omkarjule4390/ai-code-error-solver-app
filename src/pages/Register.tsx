import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const profile = await authApi.register(email, password, fullName)
      setUser(profile)
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center px-3" style={{ minHeight: 'calc(100vh - 72px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-solid rounded-xl p-4 p-sm-5 w-100"
        style={{ maxWidth: 420 }}
      >
        <div className="d-flex flex-column align-items-center gap-2 text-center mb-4">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--cyan-400), var(--mint-300))' }}
          >
            <i className="bi bi-code-slash fs-4" style={{ color: 'var(--navy-950)' }} />
          </div>
          <h1 className="fs-3 fw-semibold text-white mb-0">Create your account</h1>
          <p className="small text-muted-soft mb-0">Start solving errors with AI in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label small text-muted-soft">Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-control form-control-dark"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="form-label small text-muted-soft">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control form-control-dark"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="form-label small text-muted-soft">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control form-control-dark"
              placeholder="At least 8 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-brand w-100 py-2 d-flex align-items-center justify-content-center gap-2">
            {loading && <span className="spinner-border spinner-border-sm" />}
            Create account
          </button>
        </form>

        <p className="mt-4 text-center small text-muted-soft mb-0">
          Already have an account?{' '}
          <Link to="/login" className="text-brand fw-medium">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
