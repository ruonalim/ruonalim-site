import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(req: NextRequest) {
  try {
    const { auditId, plan } = await req.json()

    if (!auditId) {
      return NextResponse.json({ error: 'Missing audit ID' }, { status: 400 })
    }

    const priceId = plan === 'agency'
      ? process.env.STRIPE_PRICE_ID_AGENCY!
      : process.env.STRIPE_PRICE_ID_SINGLE!

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/audit/result/${auditId}?paid=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/audit/result/${auditId}?paid=false`,
      metadata: { auditId, plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Payment error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
