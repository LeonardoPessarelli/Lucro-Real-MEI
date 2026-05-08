import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(new URL('/login', origin))
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    console.error('[auth/callback]', exchangeError.message)
    return NextResponse.redirect(new URL('/login', origin))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', origin))
  }

  const serviceClient = createServiceClient()

  // Profile é criado pelo trigger on_auth_user_created — só verificamos subscription
  const { data: subscription } = await serviceClient
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!subscription) {
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)

    const { error: insertError } = await serviceClient.from('subscriptions').insert({
      user_id: user.id,
      status: 'trial',
      trial_ends_at: trialEnd.toISOString(),
    })
    // 23505 = unique constraint — race condition, subscription já criada, segue para /config
    if (insertError && insertError.code !== '23505') {
      console.error('[auth/callback] insert subscription:', insertError.message)
      return NextResponse.redirect(new URL('/', origin))
    }

    try {
      const { sendWelcomeEmail } = await import('@/lib/resend')
      if (user.email) {
        await sendWelcomeEmail(user.email, user.user_metadata?.full_name ?? 'MEI')
      }
    } catch {
      // non-critical, não bloqueia o onboarding
    }

    return NextResponse.redirect(new URL('/onboarding', origin))
  }

  return NextResponse.redirect(new URL('/', origin))
}
