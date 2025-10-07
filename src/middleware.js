import { NextResponse } from 'next/server'
import { parseSessionCookie } from '@/lib/session'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect all routes under /dashboard, /tasks, /profile
  const protectedPrefixes = ['/dashboard', '/tasks', '/profile']
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  // Admin routes require ADMIN role
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isProtected && !isAdminRoute) return NextResponse.next()

  const session = await parseSessionCookie(request)
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Parse role for admin routes
  if (isAdminRoute) {
    if (session.role !== 'ADMIN') {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/profile/:path*', '/admin/:path*'],
}
