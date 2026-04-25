import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const token = request.headers.get('asaas-access-token')
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { event, payment } = body

  if (!payment?.customer) return NextResponse.json({ ok: true })

  const supabase = createServiceClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('asaas_id', payment.customer)
    .single()

  if (!sub) return NextResponse.json({ ok: true })

  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    await supabase.from('subscriptions')
      .update({ status: 'active' })
      .eq('user_id', sub.user_id)
  }

  if (event === 'PAYMENT_OVERDUE' || event === 'SUBSCRIPTION_DELETED') {
    await supabase.from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', sub.user_id)
  }

  return NextResponse.json({ ok: true })
}
