import prisma from '@/lib/prisma'
import { createSessionCookie } from '@/lib/session'
import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { getWorkingHours, isNowWithinWindow } from '@/lib/settings'

function badRequest(message) {
  return Response.json({ ok: false, error: message }, { status: 400 })
}

export async function POST(request) {
  let phone, settlementId
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json')) {
      const body = await request.json()
      phone = (body.phone || '').trim()
      settlementId = (body.settlementId || '').trim()
    } else {
      const form = await request.formData()
      phone = (form.get('phone') || '').toString().trim()
      settlementId = (form.get('settlementId') || '').toString().trim()
    }
  } catch (e) {
    return badRequest('Invalid request body')
  }

  if (!phone) return badRequest('Phone is required')
  if (!settlementId) return badRequest('Settlement is required')

  try {
    // Check working hours for workers (admins bypass)
    const { start, end } = await getWorkingHours()
    const user = await prisma.user.findFirst({
      where: {
        phone,
        OR: [
          { settlementId }, // worker login must match settlement
          { role: 'ADMIN', settlementId: null }, // admin flexibility
        ],
      },
      select: { id: true, role: true, settlementId: true, active: true },
    })

    if (!user) {
      return Response.json({ ok: false, error: 'Invalid phone number or settlement' }, { status: 401 })
    }

    // Block suspended users at login
    if (user.active === false) {
      return Response.json({ ok: false, error: 'Your account has been suspended.' }, { status: 403 })
    }

    if (user.role !== 'ADMIN' && !isNowWithinWindow(start, end)) {
      return Response.json({ ok: false, error: `Work is currently available only between ${start || 'start'} and ${end || 'end'}.` }, { status: 403 })
    }

  // Generate a new sessionId and persist on user to invalidate any prior session
  const newSessionId = crypto.randomUUID()
  await prisma.user.update({ where: { id: user.id }, data: { sessionId: newSessionId } })

  const cookie = await createSessionCookie({ id: user.id, role: user.role, sid: newSessionId })
  try { await prisma.activityLog.create({ data: { userId: user.id, type: 'LOGIN' } }) } catch {}
  const redirectTo = user.role === 'ADMIN' ? '/admin/campaigns' : '/dashboard'
  const res = NextResponse.redirect(new URL(redirectTo, request.url), 303)
  res.headers.append('set-cookie', cookie)
  return res
  } catch (e) {
    console.error('Login error:', e)
    const msg = process.env.NODE_ENV === 'development' ? (e?.message || 'Server error') : 'Server error'
    return Response.json({ ok: false, error: msg }, { status: 500 })
  }
}
