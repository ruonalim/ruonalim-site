import { NextRequest, NextResponse } from 'next/server'
import { saveAudit } from '@/lib/store'
import type { AuditFull } from '@/lib/types'

/**
 * POST /api/audit/seed
 * Seeds a manually-created audit into Redis.
 * Protected by a simple secret to prevent abuse.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()

  // Simple auth — must match SEED_SECRET env var (or defaults to checking it exists)
  const secret = req.headers.get('x-seed-secret') || body.secret
  if (!secret || secret !== (process.env.SEED_SECRET || 'ruonalim-seed-2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const audit = body.audit as AuditFull

  if (!audit || !audit.auditId || typeof audit.overallScore !== 'number') {
    return NextResponse.json({ error: 'Invalid audit data' }, { status: 400 })
  }

  // Ensure required fields
  audit.createdAt = audit.createdAt || new Date().toISOString()
  audit.paid = audit.paid ?? false

  await saveAudit(audit)

  return NextResponse.json({
    success: true,
    auditId: audit.auditId,
    url: `/audit/result/${audit.auditId}`,
    paid: audit.paid,
  })
}
