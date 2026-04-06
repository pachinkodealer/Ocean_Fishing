import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const service = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id

    if (userId) {
      await service
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    // Find user by customer ID and downgrade
    const customers = await stripe.customers.list({ limit: 1 })
    const customer = customers.data.find(c => c.id === subscription.customer)
    if (customer?.email) {
      const { data: profile } = await service
        .from('profiles')
        .select('id')
        .eq('id', subscription.metadata?.user_id ?? '')
        .single()
      if (profile) {
        await service
          .from('profiles')
          .update({ plan: 'free' })
          .eq('id', profile.id)
      }
    }
  }

  return NextResponse.json({ received: true })
}
