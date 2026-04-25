import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      const serviceClient = createServiceClient()

      // Criar profile se não existir
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        await serviceClient.from('profiles').insert({
          id: session.user.id,
          nome: session.user.user_metadata?.full_name ?? null,
        })

        // Criar subscription trial
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 7)
        await serviceClient.from('subscriptions').insert({
          user_id: session.user.id,
          status: 'trial',
          trial_ends_at: trialEnd.toISOString(),
        })

        // Boas-vindas por e-mail
        try {
          const { sendWelcomeEmail } = await import('@/lib/resend')
          if (session.user.email) {
            await sendWelcomeEmail(session.user.email, session.user.user_metadata?.full_name ?? 'MEI')
          }
        } catch {
          // non-critical, don't block onboarding
        }

        return NextResponse.redirect(new URL('/config', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
