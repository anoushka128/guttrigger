import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // Skip auth checks if Supabase isn't configured yet
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  if (!supabaseUrl.startsWith('https://') || supabaseKey.length < 20) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAppRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/log-meal') ||
    pathname.startsWith('/log-symptom') ||
    pathname.startsWith('/log') ||
    pathname.startsWith('/insights') ||
    pathname.startsWith('/timeline') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/check-in') ||
    pathname.startsWith('/onboarding')

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')

  if (isAppRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && user && !request.nextUrl.searchParams.get('error')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
