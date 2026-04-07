export interface HeuristicScore {
  id: number
  name: string
  score: number
  status: 'pass' | 'minor' | 'major' | 'critical'
  finding: string
}

export interface AuditIssue {
  severity: 'critical' | 'major' | 'minor'
  heuristic: string
  title: string
  description: string
  recommendation: string
  location?: string
}

export interface AuditPreview {
  auditId: string
  overallScore: number
  headline: string
  totalIssuesFound: number
  previewIssues: AuditIssue[]
  lockedIssueCount: number
  topStrength: string
  inputType: 'url' | 'figma' | 'screenshots'
  inputLabel: string
  createdAt: string
}

export interface ExtendedScore {
  score: number
  status: 'pass' | 'minor' | 'major' | 'critical'
  finding: string
}

export interface AuditFull extends AuditPreview {
  heuristics: HeuristicScore[]
  criticalIssues: AuditIssue[]
  majorIssues: AuditIssue[]
  minorIssues: AuditIssue[]
  strengths: string[]
  priorityActions: string[]
  paid: boolean
  credits?: number
  conversionScore?: ExtendedScore
  mobileScore?: ExtendedScore
  trustScore?: ExtendedScore
  seoScore?: ExtendedScore
  appScore?: ExtendedScore
}

export type InputMode = 'url' | 'figma' | 'screenshots'
