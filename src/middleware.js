import { NextResponse } from 'next/server'
import { parseSessionCookie } from '@/lib/session'
import prisma from '@/lib/prisma'

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

  // Enforce single active session: verify DB sessionId matches cookie sid
  try {
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { sessionId: true, role: true } })
    if (!user || (user.sessionId && user.sessionId !== session.sid)) {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.headers.append('set-cookie', 'mt_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
      return res
    }
    // Optional: tighten role consistency
    if (isAdminRoute && user.role !== 'ADMIN') {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.headers.append('set-cookie', 'mt_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
      return res
    }
  } catch {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.headers.append('set-cookie', 'mt_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
    return res
  }

  // (Admin route role check handled above with DB consistency validation.)

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/profile/:path*', '/admin/:path*'],
}
