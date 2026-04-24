import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  const isPublic = path.startsWith('/login') || path.startsWith('/api/')

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (session && !isPublic && path !== '/assinatura') {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', session.user.id)
      .single()

    if (sub) {
      const trialExpired = sub.status === 'trial' &&
        new Date(sub.trial_ends_at) < new Date()
      if (trialExpired || sub.status === 'expired') {
        return NextResponse.redirect(new URL('/assinatura', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
