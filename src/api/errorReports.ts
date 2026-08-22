import { supabase } from '@/supabaseClient'
import type { AiAnalysis, ErrorReport } from '@/types'

interface ErrorReportRow {
  id: string
  user_id: string
  code_snippet: string
  error_message: string
  programming_language: string
  ai_analysis: AiAnalysis
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

export const errorReportsApi = {
  async create(
    userId: string,
    payload: { codeSnippet: string; errorMessage: string; programmingLanguage: string; aiAnalysis: AiAnalysis },
  ): Promise<ErrorReport> {
    const { data, error } = await supabase
      .from('error_reports')
      .insert({
        user_id: userId,
        code_snippet: payload.codeSnippet,
        error_message: payload.errorMessage,
        programming_language: payload.programmingLanguage,
        ai_analysis: payload.aiAnalysis,
        solved: true,
      })
      .select()
      .single()
    if (error) throw error
    return mapRow(data)
  },

  async getHistory(userId: string, page = 0, size = 10): Promise<{ content: ErrorReport[]; totalPages: number; last: boolean }> {
    const from = page * size
    const to = from + size - 1
    const { data, count, error } = await supabase
      .from('error_reports')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / size))
    return { content: (data ?? []).map(mapRow), totalPages, last: page >= totalPages - 1 }
  },

  async getStats(userId: string): Promise<{ totalReports: number; solvedReports: number }> {
    const { count: total, error: e1 } = await supabase
      .from('error_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    if (e1) throw e1
    const { count: solved, error: e2 } = await supabase
      .from('error_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('solved', true)
    if (e2) throw e2
    return { totalReports: total ?? 0, solvedReports: solved ?? 0 }
  },

  async remove(id: string) {
    const { error } = await supabase.from('error_reports').delete().eq('id', id)
    if (error) throw error
  },

  async setBookmarked(id: string, bookmarked: boolean) {
    const { error } = await supabase.from('error_reports').update({ bookmarked }).eq('id', id)
    if (error) throw error
  },
}
