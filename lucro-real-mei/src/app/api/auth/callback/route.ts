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

      // Verifica se é o primeiro login (subscription ainda não existe)
      const { data: subscription } = await serviceClient
        .from('subscriptions')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!subscription) {
        // Profile já foi criado pelo trigger on_auth_user_created
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 7)

        await serviceClient.from('subscriptions').insert({
          user_id: session.user.id,
          status: 'trial',
          trial_ends_at: trialEnd.toISOString(),
        })

        try {
          const { sendWelcomeEmail } = await import('@/lib/resend')
          if (session.user.email) {
            await sendWelcomeEmail(
              session.user.email,
              session.user.user_metadata?.full_name ?? 'MEI'
            )
          }
        } catch {
          // non-critical, não bloqueia o onboarding
        }

        return NextResponse.redirect(new URL('/config', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
