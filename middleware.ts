import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Endpoints that receive legitimate cross-origin POST requests (webhooks, public store checkout)
const CSRF_EXEMPT_PATHS = [
  '/api/stripe/webhook',
  '/api/store/checkout',
  '/api/bookings/create',
]

function isCsrfSafe(req: NextRequest): boolean {
  const method = req.method.toUpperCase()
  // Only enforce on state-changing requests to API routes
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true
  if (!req.nextUrl.pathname.startsWith('/api/')) return true
  if (CSRF_EXEMPT_PATHS.some((p) => req.nextUrl.pathname.startsWith(p))) return true

  const origin = req.headers.get('origin')
  // If no Origin header (e.g. server-side curl) allow through — browsers always send it
  if (!origin) return true

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
  try {
    const originHost = new URL(origin).host
    const appHost = new URL(appUrl).host
    return originHost === appHost
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  // CSRF check before any session work
  if (!isCsrfSafe(req)) {
    return new NextResponse(JSON.stringify({ error: 'CSRF check failed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if needed
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect routes that require authentication
  const protectedRoutes = ['/create', '/dashboard', '/editor']
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
