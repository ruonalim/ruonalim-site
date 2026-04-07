import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { markAuditPaid, addCredits } from '@/lib/store'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const auditId = session.metadata?.auditId
    const plan = session.metadata?.plan
    const email = session.customer_email || session.customer_details?.email

    if (plan === 'agency' && email) {
      // Agency pack: add 5 credits and unlock current audit
      await addCredits(email, 5)
      console.log(`Added 5 agency credits for ${email}`)
    }

    if (auditId) {
      await markAuditPaid(auditId)
      console.log(`Audit ${auditId} marked as paid (plan: ${plan})`)
    }
  }

  return NextResponse.json({ received: true })
}

// Disable body parsing for webhook (Stripe needs raw body)
export const runtime = 'nodejs'
