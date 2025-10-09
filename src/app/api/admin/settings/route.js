import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { getWorkingHours, upsertWorkingHours, parseHHmm } from '@/lib/settings'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const admin = await requireAdmin(request)
  if (!admin) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const wh = await getWorkingHours()
  return Response.json({ ok: true, workingHours: wh })
}

export async function POST(request) {
  const admin = await requireAdmin(request)
  if (!admin) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const ct = request.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    let body
    try { body = await request.json() } catch { return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }) }
    const start = typeof body.start === 'string' ? body.start.trim() : null
    const end = typeof body.end === 'string' ? body.end.trim() : null
    if (start && !parseHHmm(start)) return Response.json({ ok: false, error: 'Invalid start time. Use HH:mm (24h).' }, { status: 400 })
    if (end && !parseHHmm(end)) return Response.json({ ok: false, error: 'Invalid end time. Use HH:mm (24h).' }, { status: 400 })
    await upsertWorkingHours(start, end)
    const wh = await getWorkingHours()
    return Response.json({ ok: true, workingHours: wh })
  }
  // Handle form submissions and redirect back to settings
  const form = await request.formData()
  const start = (form.get('start') || '').toString().trim() || null
  const end = (form.get('end') || '').toString().trim() || null
  if (start && !parseHHmm(start)) return Response.json({ ok: false, error: 'Invalid start time. Use HH:mm (24h).' }, { status: 400 })
  if (end && !parseHHmm(end)) return Response.json({ ok: false, error: 'Invalid end time. Use HH:mm (24h).' }, { status: 400 })
  await upsertWorkingHours(start, end)
  return NextResponse.redirect(new URL('/admin/settings', request.url), 303)
}
