import { NextRequest, NextResponse } from 'next/server'
import { getAudit, toPreview } from '@/lib/store'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Missing audit ID' }, { status: 400 })
  }

  const audit = await getAudit(id)

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  }

  // If paid, return full audit. Otherwise return preview only.
  if (audit.paid) {
    return NextResponse.json(audit)
  }

  return NextResponse.json(toPreview(audit))
}
