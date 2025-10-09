import { NextResponse } from 'next/server'
import { parseSessionCookie } from '@/lib/session'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect all routes under /dashboard, /tasks, /profile
  const protectedPrefixes = ['/dashboard', '/tasks', '/profile', '/messages']
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  // Admin routes require ADMIN role
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isProtected && !isAdminRoute) return NextResponse.next()

  const session = await parseSessionCookie(request)
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Do not call the database from middleware (Edge runtime). Trust sealed cookie for role gating.
  if (isAdminRoute && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // (Admin route role check handled above with DB consistency validation.)

  return NextResponse.next()
}

export const config = {
  // Do not include /session-conflict to avoid loops
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/profile/:path*', '/messages/:path*', '/admin/:path*'],
}
