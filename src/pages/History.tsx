import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { errorReportsApi } from '@/api/errorReports'
import { useAuthStore } from '@/store/authStore'

export default function History() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['history', userId, page],
    queryFn: () => errorReportsApi.getHistory(userId, page, 10),
    enabled: !!userId,
  })

  const handleDelete = async (id: string) => {
    try {
      await errorReportsApi.remove(id)
      toast.success('Report deleted')
      queryClient.invalidateQueries({ queryKey: ['history'] })
    } catch {
      toast.error('Could not delete report')
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h1 className="fs-2 fw-semibold text-white">History</h1>
      <p className="small text-muted-soft">All the errors you've analyzed.</p>

      <div className="mt-3 d-flex flex-column gap-2">
        {data?.content.length ? (
          data.content.map((item) => (
            <div key={item.id} className="d-flex align-items-center justify-content-between bg-surface rounded-xl p-3">
              <div className="d-flex align-items-start gap-3">
                <i
                  className={`bi ${item.solved ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted-soft'} mt-1`}
                />
                <div>
                  <p className="small fw-medium text-white mb-0">{item.programmingLanguage}</p>
                  <p className="small text-muted-soft mb-0 text-truncate" style={{ maxWidth: 460 }}>
                    {item.errorMessage}
                  </p>
                  <p className="text-muted-soft mb-0" style={{ fontSize: '0.7rem' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="btn btn-sm text-muted-soft"
                aria-label="Delete report"
              >
                <i className="bi bi-trash3" />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-xl p-4 text-center small text-muted-soft" style={{ border: '1px dashed var(--border-800)' }}>
            No reports yet.
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 d-flex align-items-center justify-content-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn btn-outline-brand btn-sm"
          >
            <i className="bi bi-chevron-left" />
          </button>
          <span className="small text-muted-soft">
            Page {page + 1} of {data.totalPages}
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={data.last} className="btn btn-outline-brand btn-sm">
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      )}
    </div>
  )
}
