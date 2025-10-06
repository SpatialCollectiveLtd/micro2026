import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect all routes under /dashboard, /tasks, /earnings, /profile
  const protectedPrefixes = ['/dashboard', '/tasks', '/earnings', '/profile']
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  // Admin routes require ADMIN role
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isProtected && !isAdminRoute) return NextResponse.next()

  const session = request.cookies.get('mt_session')?.value
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Parse role for admin routes
  if (isAdminRoute) {
    try {
      const decoded = JSON.parse(Buffer.from(session, 'base64').toString('utf8'))
      if (decoded.role !== 'ADMIN') {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
    } catch {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/earnings/:path*', '/profile/:path*', '/admin/:path*'],
}
