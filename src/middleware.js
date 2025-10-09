import { NextResponse } from 'next/server'
import { parseSessionCookie } from '@/lib/session'
import prisma from '@/lib/prisma'

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

  // Enforce single active session: verify DB sessionId matches cookie sid
  try {
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { sessionId: true, role: true } })
    if (!user || (user.sessionId && user.sessionId !== session.sid)) {
      // Redirect to session conflict page and keep the cookie so the user can resolve it
      return NextResponse.redirect(new URL('/session-conflict', request.url))
    }
    // Optional: tighten role consistency
    if (isAdminRoute && user.role !== 'ADMIN') {
      // Not an admin trying to access admin route: send to dashboard without clearing session
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // (Admin route role check handled above with DB consistency validation.)

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/profile/:path*', '/messages/:path*', '/admin/:path*'],
}
