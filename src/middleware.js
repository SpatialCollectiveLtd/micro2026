import { NextResponse } from 'next/server'
import { unsealData } from 'iron-session/edge'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect all routes under /dashboard, /tasks, /earnings, /profile
  const protectedPrefixes = ['/dashboard', '/tasks', '/earnings', '/profile']
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  // Admin routes require ADMIN role
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isProtected && !isAdminRoute) return NextResponse.next()

  const token = request.cookies.get('mt_session')?.value
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Parse role for admin routes
  if (isAdminRoute) {
    let decoded = null
    // Try iron-session sealed cookie first
    try {
      decoded = await unsealData(token, { password: process.env.SESSION_SECRET || 'dev-secret-change-me' })
    } catch {
      // Fallback to legacy base64 JSON for existing cookies
      try { decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8')) } catch {}
    }
    if (!decoded || decoded.role !== 'ADMIN') {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/earnings/:path*', '/profile/:path*', '/admin/:path*'],
}
