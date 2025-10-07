import prisma from '@/lib/prisma'
import { createSessionCookie } from '@/lib/session'
import { NextResponse } from 'next/server'

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
    const user = await prisma.user.findFirst({
      where: {
        phone,
        OR: [
          { settlementId }, // worker login
          { role: 'ADMIN', settlementId: null }, // admin can login without settlement
        ],
      },
      select: { id: true, role: true, settlementId: true },
    })

    if (!user) {
      return Response.json({ ok: false, error: 'Invalid phone number or settlement' }, { status: 401 })
    }

  const cookie = await createSessionCookie({ id: user.id, role: user.role, sid: crypto.randomUUID() })
  const redirectTo = user.role === 'ADMIN' ? '/admin/campaigns' : '/dashboard'
  const res = NextResponse.redirect(new URL(redirectTo, request.url), 303)
  res.headers.append('set-cookie', cookie)
  return res
  } catch (e) {
    return Response.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
