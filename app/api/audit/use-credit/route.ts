import { NextRequest, NextResponse } from 'next/server'
import { getCredits, useCredit, markAuditPaid } from '@/lib/store'

export async function POST(req: NextRequest) {
  try {
    const { email, auditId } = await req.json()

    if (!email || !auditId) {
      return NextResponse.json({ error: 'Missing email or audit ID' }, { status: 400 })
    }

    const credits = await getCredits(email)

    if (credits <= 0) {
      return NextResponse.json({ error: 'No credits remaining', credits: 0 }, { status: 402 })
    }

    const used = await useCredit(email)
    if (!used) {
      return NextResponse.json({ error: 'Failed to use credit' }, { status: 500 })
    }

    await markAuditPaid(auditId)

    return NextResponse.json({
      success: true,
      creditsRemaining: credits - 1,
    })
  } catch (error: unknown) {
    console.error('Use credit error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET: check credits for an email
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const credits = await getCredits(email)
  return NextResponse.json({ credits })
}
