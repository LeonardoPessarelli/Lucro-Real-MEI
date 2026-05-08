import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublicPath =
    path.startsWith('/login') ||
    path.startsWith('/landing') ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/webhooks/')

  if (!user) {
    if (isPublicPath) return response
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isPublicPath) return response

  const { data: profile } = await supabase
    .from('profiles')
    .select('setup_completo')
    .eq('id', user.id)
    .single()

  if (profile && !profile.setup_completo) {
    if (path !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    return response
  }

  if (path !== '/assinatura') {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', user.id)
      .single()

    if (subscription) {
      const trialExpirado =
        subscription.status === 'trial' &&
        new Date(subscription.trial_ends_at) < new Date()

      if (trialExpirado || subscription.status === 'expired') {
        return NextResponse.redirect(new URL('/assinatura', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
