import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function POST(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const body = await request.json().catch(() => ({}))
  const hours = Math.max(1, Math.min(24*30, parseInt(body.olderThanHours || '24', 10)))
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
  const res = await prisma.activityLog.deleteMany({ where: { createdAt: { lt: cutoff } } })
  return Response.json({ ok: true, deleted: res.count })
}
