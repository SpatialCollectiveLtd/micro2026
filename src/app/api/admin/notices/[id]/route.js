import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function PATCH(request, { params }) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const id = params.id
  const form = await request.formData()
  const title = (form.get('title') || '').toString().trim()
  const message = (form.get('message') || '').toString().trim()
  const priority = (form.get('priority') || 'MEDIUM').toString().toUpperCase()
  const active = form.get('active') === 'on'
  const allUsers = form.get('allUsers') === 'on'
  const selectedSettlements = form.getAll('settlements').map(v => v.toString())
  if (!['LOW','MEDIUM','HIGH'].includes(priority)) return Response.json({ ok: false, error: 'Invalid priority' }, { status: 400 })

  const updated = await prisma.notice.update({ where: { id }, data: { title, message, priority, active, allUsers } })
  // Reset audience links if not allUsers
  await prisma.noticeSettlement.deleteMany({ where: { noticeId: id } })
  if (!allUsers && selectedSettlements.length > 0) {
    await prisma.$transaction(selectedSettlements.map(sid => prisma.noticeSettlement.create({ data: { noticeId: id, settlementId: sid } })))
  }
  return Response.json({ ok: true, notice: updated })
}

export async function DELETE(request, { params }) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const id = params.id
  await prisma.noticeSettlement.deleteMany({ where: { noticeId: id } })
  await prisma.notice.delete({ where: { id } })
  return Response.json({ ok: true })
}
