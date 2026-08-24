import { supabase, isMockMode } from '@/supabaseClient'
import type { ErrorReport } from '@/types'

interface ErrorReportRow {
  id: string
  user_id: string
  code_snippet: string
  error_message: string
  programming_language: string
  ai_analysis: ErrorReport['aiAnalysis']
  solved: boolean
  bookmarked: boolean
  created_at: string
}

function mapRow(row: ErrorReportRow): ErrorReport {
  return {
    id: row.id,
    userId: row.user_id,
    codeSnippet: row.code_snippet,
    errorMessage: row.error_message,
    programmingLanguage: row.programming_language,
    aiAnalysis: row.ai_analysis,
    solved: row.solved,
    bookmarked: row.bookmarked,
    createdAt: row.created_at,
  }
}

export const bookmarksApi = {
  async getBookmarks(userId: string, page = 0, size = 10): Promise<{ content: ErrorReport[]; totalPages: number; last: boolean }> {
    if (isMockMode) {
      const data = localStorage.getItem('mock_error_reports')
      const reports: ErrorReport[] = data ? JSON.parse(data) : []
      const bookmarked = reports.filter((r) => r.userId === userId && r.bookmarked)
      const from = page * size
      const to = from + size
      const paginated = bookmarked.slice(from, to)
      const totalPages = Math.max(1, Math.ceil(bookmarked.length / size))
      return {
        content: paginated,
        totalPages,
        last: page >= totalPages - 1,
      }
    }

    const from = page * size
    const to = from + size - 1
    const { data, count, error } = await supabase
      .from('error_reports')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('bookmarked', true)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / size))
    return { content: (data ?? []).map(mapRow), totalPages, last: page >= totalPages - 1 }
  },
}

