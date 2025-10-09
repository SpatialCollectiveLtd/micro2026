import prisma from '@/lib/prisma'
import { createSessionCookie, parseSessionCookie } from '@/lib/session'
import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

export async function POST(request) {
  try {
    const session = await parseSessionCookie(request)
    if (!session) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, role: true } })
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

    // Regenerate sessionId to invalidate other device
    const newSessionId = crypto.randomUUID()
    await prisma.user.update({ where: { id: user.id }, data: { sessionId: newSessionId } })

    // Log the conflict resolution for auditing (best-effort)
    try {
      await prisma.activityLog.create({ data: { userId: user.id, type: 'SESSION_CONFLICT_RESOLVED' } })
    } catch {}

    const cookie = await createSessionCookie({ id: user.id, role: user.role, sid: newSessionId })
    const redirectTo = user.role === 'ADMIN' ? '/admin/campaigns' : '/dashboard'
    const res = NextResponse.json({ ok: true, redirectTo })
    res.headers.append('set-cookie', cookie)
    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
