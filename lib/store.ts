import { Redis } from '@upstash/redis'
import type { AuditFull, AuditPreview } from './types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const AUDIT_TTL = 60 * 60 * 24 * 90 // 90 days

export async function saveAudit(audit: AuditFull): Promise<void> {
  await redis.set(`audit:${audit.auditId}`, JSON.stringify(audit), { ex: AUDIT_TTL })
}

export async function getAudit(auditId: string): Promise<AuditFull | null> {
  const data = await redis.get<string>(`audit:${auditId}`)
  if (!data) return null
  return typeof data === 'string' ? JSON.parse(data) : data as unknown as AuditFull
}

export async function markAuditPaid(auditId: string): Promise<AuditFull | null> {
  const audit = await getAudit(auditId)
  if (!audit) return null
  audit.paid = true
  await saveAudit(audit)
  return audit
}

export function toPreview(audit: AuditFull): AuditPreview {
  return {
    auditId: audit.auditId,
    overallScore: audit.overallScore,
    headline: audit.headline,
    totalIssuesFound: audit.totalIssuesFound,
    previewIssues: audit.previewIssues,
    lockedIssueCount: audit.lockedIssueCount,
    topStrength: audit.topStrength,
    inputType: audit.inputType,
    inputLabel: audit.inputLabel,
    createdAt: audit.createdAt,
  }
}

// Owner emails — unlimited credits, never decremented
const OWNER_EMAILS = ['hello@ruonalim.com']

// Agency pack credits
export async function getCredits(email: string): Promise<number> {
  if (OWNER_EMAILS.includes(email.toLowerCase().trim())) return 9999
  const credits = await redis.get<number>(`credits:${email}`)
  return credits ?? 0
}

export async function addCredits(email: string, amount: number): Promise<void> {
  if (OWNER_EMAILS.includes(email.toLowerCase().trim())) return // no-op for owner
  const current = await getCredits(email)
  await redis.set(`credits:${email}`, current + amount)
}

export async function useCredit(email: string): Promise<boolean> {
  if (OWNER_EMAILS.includes(email.toLowerCase().trim())) return true // always succeeds
  const current = await getCredits(email)
  if (current <= 0) return false
  await redis.set(`credits:${email}`, current - 1)
  return true
}
