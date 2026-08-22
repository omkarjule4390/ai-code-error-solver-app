import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { errorReportsApi } from '@/api/errorReports'
import { useAuthStore } from '@/store/authStore'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''

  const { data: stats } = useQuery({
    queryKey: ['stats', userId],
    queryFn: () => errorReportsApi.getStats(userId),
    enabled: !!userId,
  })

  const { data: history } = useQuery({
    queryKey: ['history', userId, 0, 5],
    queryFn: () => errorReportsApi.getHistory(userId, 0, 5),
    enabled: !!userId,
  })

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <h1 className="fs-2 fw-semibold text-white">Welcome back, {user?.fullName?.split(' ')[0] || 'there'} 👋</h1>
      <p className="text-muted-soft small">Here's a quick look at your debugging activity.</p>

      <div className="row g-3 mt-2">
        <div className="col-12 col-sm-4">
          <StatCard icon="bi-code-slash" label="Total Reports" value={stats?.totalReports ?? '—'} />
        </div>
        <div className="col-12 col-sm-4">
          <StatCard icon="bi-check-circle-fill" label="Solved" value={stats?.solvedReports ?? '—'} />
        </div>
        <div className="col-12 col-sm-4">
          <StatCard
            icon="bi-graph-up-arrow"
            label="Success Rate"
            value={
              stats && stats.totalReports > 0 ? `${Math.round((stats.solvedReports / stats.totalReports) * 100)}%` : '—'
            }
          />
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-5">
        <h2 className="fs-5 fw-semibold text-white mb-0">Recent activity</h2>
        <Link to="/history" className="small text-brand text-decoration-none">
          View all <i className="bi bi-arrow-right" />
        </Link>
      </div>

      <div className="mt-3 d-flex flex-column gap-2">
        {history?.content.length ? (
          history.content.map((item) => (
            <Link
              key={item.id}
              to="/history"
              className="d-flex align-items-center justify-content-between bg-surface rounded-xl p-3 text-decoration-none report-row"
            >
              <div>
                <p className="small fw-medium text-white mb-0">{item.programmingLanguage}</p>
                <p className="small text-muted-soft mb-0 text-truncate" style={{ maxWidth: 420 }}>
                  {item.errorMessage}
                </p>
              </div>
              <span className="small text-muted-soft">{new Date(item.createdAt).toLocaleDateString()}</span>
            </Link>
          ))
        ) : (
          <div className="rounded-xl p-4 text-center small text-muted-soft" style={{ border: '1px dashed var(--border-800)' }}>
            No activity yet.{' '}
            <Link to="/solver" className="text-brand">
              Analyze your first error
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-surface rounded-xl p-3">
      <div
        className="d-flex align-items-center justify-content-center rounded-3 mb-2"
        style={{ width: 36, height: 36, background: 'rgba(109,117,245,0.15)', color: 'var(--brand-400)' }}
      >
        <i className={`bi ${icon}`} />
      </div>
      <p className="fs-4 fw-semibold text-white mb-0">{value}</p>
      <p className="small text-muted-soft mb-0">{label}</p>
    </motion.div>
  )
}
