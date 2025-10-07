import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function PATCH(request, { params }) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const id = params.id
  const body = await request.json().catch(() => null)
  if (!body || typeof body.groundTruth === 'undefined') return Response.json({ ok: false, error: 'groundTruth required' }, { status: 400 })
  const updated = await prisma.image.update({ where: { id }, data: { groundTruth: body.groundTruth } })
  return Response.json({ ok: true, image: updated })
}
