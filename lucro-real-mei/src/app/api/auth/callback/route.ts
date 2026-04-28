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
    return NextResponse.redirect(new URL('/login', origin))
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', origin))
  }

  const serviceClient = createServiceClient()

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await serviceClient.from('profiles').insert({
      id: user.id,
      nome: user.user_metadata?.full_name ?? null,
    })

    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 7)
    await serviceClient.from('subscriptions').insert({
      user_id: user.id,
      status: 'trial',
      trial_ends_at: trialEnd.toISOString(),
    })

    try {
      const { sendWelcomeEmail } = await import('@/lib/resend')
      if (user.email) {
        await sendWelcomeEmail(user.email, user.user_metadata?.full_name ?? 'MEI')
      }
    } catch {
      // non-critical, don't block onboarding
    }

    return NextResponse.redirect(new URL('/config', origin))
  }

  return NextResponse.redirect(new URL('/', origin))
}
