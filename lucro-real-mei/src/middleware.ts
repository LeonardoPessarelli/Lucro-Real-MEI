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
  const isPublic = path.startsWith('/login') || path.startsWith('/api/')
  const isOnboarding = path === '/onboarding'

  if (!user && !isPublic && !isOnboarding) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && !isPublic) {
    if (!isOnboarding) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('setup_completo')
        .eq('id', user.id)
        .single()

      if (profile && profile.setup_completo === false) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', user.id)
      .single()

    if (!sub) {
      if (path !== '/assinatura') {
        return NextResponse.redirect(new URL('/assinatura', request.url))
      }
      return response
    }

    const trialExpired = sub.status === 'trial' && new Date(sub.trial_ends_at) < new Date()
    const needsPayment = trialExpired || sub.status === 'expired'

    if (needsPayment && path !== '/assinatura') {
      return NextResponse.redirect(new URL('/assinatura', request.url))
    }

    if (sub.status === 'active' && path === '/assinatura') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
