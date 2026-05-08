import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
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

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && !isPublic) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', user.id)
      .single()

    // Subscription ausente = race condition no primeiro login (trigger ainda rodando).
    // Deixa passar para /config e /assinatura; bloqueia o restante.
    if (!sub) {
      if (path !== '/config' && path !== '/assinatura') {
        return NextResponse.redirect(new URL('/config', request.url))
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
