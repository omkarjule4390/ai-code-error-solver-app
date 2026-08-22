export interface Profile {
  id: string
  email: string
  fullName: string
  createdAt: string
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface AiAnalysis {
  rootCause: string
  explanation: string
  correctedCode: string
  bestPractices: string[]
  relatedConcepts: string[]
  severity: Severity
  confidenceScore: number
  tokensUsed: number
}

export interface ErrorReport {
  id: string
  userId: string
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
