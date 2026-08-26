import { supabase } from '@/supabaseClient'
import type { AiAnalysis, ErrorAnalysisPayload } from '@/types'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const aiSolverApi = {
  /**
   * Calls the `solve-error` Supabase Edge Function, which securely holds the
   * Groq API key server-side and returns a structured AiAnalysis. Retries a
   * couple of times with a short backoff, since the free-tier AI provider
   * occasionally returns a transient 502/429 under load.
   */
  async analyze(payload: ErrorAnalysisPayload): Promise<AiAnalysis> {
    const maxAttempts = 3
    let lastError: unknown = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { data, error } = await supabase.functions.invoke<AiAnalysis>('solve-error', {
        body: payload,
      })

      if (!error && data) {
        return data
      }

      lastError = error ?? new Error('No response from AI solver')

      if (attempt < maxAttempts) {
        await delay(attempt * 1000) // 1s, then 2s
      }
    }

    throw lastError instanceof Error ? lastError : new Error('AI solver failed after multiple attempts')
  },
}
