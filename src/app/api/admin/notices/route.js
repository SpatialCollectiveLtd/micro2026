import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function GET(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const notices = await prisma.notice.findMany({ include: { settlements: { include: { settlement: true } } }, orderBy: { createdAt: 'desc' } })
  return Response.json({ ok: true, notices })
}

export async function POST(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const form = await request.formData()
  const title = (form.get('title') || '').toString().trim()
  const message = (form.get('message') || '').toString().trim()
  const priority = (form.get('priority') || 'MEDIUM').toString().toUpperCase()
  const allUsers = form.get('allUsers') === 'on'
  const selectedSettlements = form.getAll('settlements').map(v => v.toString())
  if (!title || !message) return Response.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  if (!['LOW','MEDIUM','HIGH'].includes(priority)) return Response.json({ ok: false, error: 'Invalid priority' }, { status: 400 })

  const notice = await prisma.notice.create({ data: { title, message, priority, allUsers, active: true } })
  if (!allUsers && selectedSettlements.length > 0) {
    await prisma.$transaction(
      selectedSettlements.map(sid => prisma.noticeSettlement.create({ data: { noticeId: notice.id, settlementId: sid } }))
    )
  }
  return Response.json({ ok: true, noticeId: notice.id, message: 'Notice created successfully' })
}
