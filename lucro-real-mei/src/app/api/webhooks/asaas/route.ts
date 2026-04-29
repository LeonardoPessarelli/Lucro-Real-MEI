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
    .select('user_id, plan')
    .eq('asaas_id', payment.customer)
    .single()

  if (!sub) return NextResponse.json({ ok: true })

  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const planFromEvent: 'monthly' | 'annual' =
      body.subscription?.billingType === 'BOLETO' && body.subscription?.cycle === 'YEARLY'
        ? 'annual'
        : 'monthly'

    await supabase.from('subscriptions')
      .update({ status: 'active', plan: planFromEvent })
      .eq('user_id', sub.user_id)

    try {
      const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id)
      if (userData?.user?.email) {
        const { sendSubscriptionConfirmedEmail } = await import('@/lib/resend')
        const planLabel = planFromEvent === 'annual' ? 'Anual' : 'Mensal'
        await sendSubscriptionConfirmedEmail(
          userData.user.email,
          userData.user.user_metadata?.full_name ?? 'MEI',
          planLabel
        )
      }
    } catch {
      // non-critical
    }
  }

  if (event === 'PAYMENT_OVERDUE' || event === 'SUBSCRIPTION_DELETED') {
    await supabase.from('subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', sub.user_id)

    if (event === 'PAYMENT_OVERDUE') {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id)
        if (userData?.user?.email) {
          const { sendTrialExpiringEmail } = await import('@/lib/resend')
          await sendTrialExpiringEmail(
            userData.user.email,
            userData.user.user_metadata?.full_name ?? 'MEI'
          )
        }
      } catch {
        // non-critical, don't fail the webhook
      }
    }
  }

  return NextResponse.json({ ok: true })
}
