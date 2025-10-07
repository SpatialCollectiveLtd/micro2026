import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function GET(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const settlements = await prisma.settlement.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  return Response.json({ ok: true, settlements })
}
