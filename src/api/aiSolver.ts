import { supabase } from '@/supabaseClient'
import type { AiAnalysis, ErrorAnalysisPayload } from '@/types'

export const aiSolverApi = {
  /**
   * Calls the `solve-error` Supabase Edge Function, which securely holds the
   * OpenAI API key server-side (see supabase/functions/solve-error/index.ts)
   * and returns a structured AiAnalysis. This never exposes the AI provider
   * key to the browser.
   */
  async analyze(payload: ErrorAnalysisPayload): Promise<AiAnalysis> {
    const { data, error } = await supabase.functions.invoke<AiAnalysis>('solve-error', {
      body: payload,
    })
    if (error) throw error
    if (!data) throw new Error('No response from AI solver')
    return data
  },
}
