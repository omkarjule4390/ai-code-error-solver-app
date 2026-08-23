import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    clearAuth()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-blur sticky-top py-3">
      <div className="container-xl d-flex align-items-center justify-content-between">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, var(--cyan-400), var(--mint-300))',
            }}
          >
            <i className="bi bi-code-slash text-white fs-5" />
          </div>
          <span className="fw-semibold fs-5 text-white">
            AI Code <span className="text-brand">Error Solver</span>
          </span>
        </Link>

        {isAuthenticated && (
          <div className="d-none d-sm-flex align-items-center gap-1">
            <NavItem to="/dashboard" icon="bi-grid" label="Dashboard" />
            <NavItem to="/solver" icon="bi-code-slash" label="Solve" />
            <NavItem to="/history" icon="bi-clock-history" label="History" />
            <NavItem to="/bookmarks" icon="bi-bookmark" label="Bookmarks" />
          </div>
        )}

        <div className="d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="d-none d-sm-inline text-muted-soft small">{user?.fullName}</span>
              <button onClick={handleLogout} className="btn btn-outline-brand btn-sm d-flex align-items-center gap-1">
                <i className="bi bi-box-arrow-right" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white-50 small text-decoration-none">
                Log in
              </Link>
              <Link to="/register" className="btn btn-brand btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link
      to={to}
      className="d-flex align-items-center gap-1 rounded-3 px-3 py-1 small text-white-50 text-decoration-none nav-item-link"
    >
      <i className={`bi ${icon}`} />
      {label}
    </Link>
  )
}
