import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect all routes under /dashboard, /tasks, /earnings, /profile
  const protectedPrefixes = ['/dashboard', '/tasks', '/earnings', '/profile']
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get('mt_session')?.value
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // TODO: Optionally validate/parse session payload here
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/earnings/:path*', '/profile/:path*'],
}
