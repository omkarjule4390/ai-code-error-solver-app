export interface Profile {
  id: string
  email: string
  fullName: string
  createdAt: string
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface AiSolution {
  title: string
  description: string
  code: string
  whenToUse?: string
}

export interface AiAnalysis {
  errorType: string
  rootCause: string
  explanation: string
  lineNumber: number | null
  fileName: string | null
  originalError: string
  correctedCode: string
  solutions: AiSolution[]
  bestRecommendation: string
  preventionTip: string
  bestPractices: string[]
  relatedConcepts: string[]
  severity: Severity
  /** Always stored as a 0–1 fraction. Use formatConfidence() to display. */
  confidenceScore: number
  tokensUsed: number
}

export interface ErrorReport {
  id: string
  userId: string
  codeName: string
  codeSnippet: string
  errorMessage: string
  programmingLanguage: string
  aiAnalysis: AiAnalysis
  solved: boolean
  bookmarked: boolean
  createdAt: string
}

export interface ErrorAnalysisPayload {
  codeSnippet: string
  errorMessage: string
  programmingLanguage: string
}

export interface UserStats {
  totalReports: number
  solvedReports: number
}
