import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Safety net: auth codes that land on the root (e.g. Supabase redirect
  // allowlist fallback) get forwarded to the callback handler
  if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const url = request.nextUrl.clone()
    url.pathname = '/callback'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /app routes
  if (!user && pathname.startsWith('/dashboard') ||
      !user && pathname.startsWith('/play') ||
      !user && pathname.startsWith('/leaderboard') ||
      !user && pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/play/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/upgrade/:path*',
    '/daily/:path*',
    '/login',
    '/signup',
  ],
}
