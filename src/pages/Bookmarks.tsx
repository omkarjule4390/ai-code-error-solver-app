import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookmarksApi } from '@/api/bookmarks'
import { errorReportsApi } from '@/api/errorReports'
import { useAuthStore } from '@/store/authStore'

export default function Bookmarks() {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id ?? ''
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['bookmarks', userId, page],
    queryFn: () => bookmarksApi.getBookmarks(userId, page, 10),
    enabled: !!userId,
  })

  const handleRemove = async (id: string) => {
    try {
      await errorReportsApi.setBookmarked(id, false)
      toast.success('Bookmark removed')
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    } catch {
      toast.error('Could not remove bookmark')
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h1 className="fs-2 fw-semibold text-white">Bookmarks</h1>
      <p className="small text-muted-soft">Your saved error reports for quick reference.</p>

      <div className="mt-3 d-flex flex-column gap-2">
        {data?.content.length ? (
          data.content.map((item) => (
            <div key={item.id} className="d-flex align-items-center justify-content-between bg-surface rounded-xl p-3">
              <div>
                <p className="small fw-medium text-white mb-0">{item.programmingLanguage}</p>
                <p className="small text-muted-soft mb-0 text-truncate" style={{ maxWidth: 460 }}>
                  {item.errorMessage}
                </p>
              </div>
              <button onClick={() => handleRemove(item.id)} className="btn btn-sm text-muted-soft" aria-label="Remove bookmark">
                <i className="bi bi-bookmark-x" />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-xl p-4 text-center small text-muted-soft" style={{ border: '1px dashed var(--border-800)' }}>
            No bookmarks yet.
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
