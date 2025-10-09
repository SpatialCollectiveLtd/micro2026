import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function GET(request) {
  const session = await requireAdmin(request)
  if (!session) return unauthorized()
  const { searchParams } = new URL(request.url)
  const status = (searchParams.get('status') || 'OPEN').toString().toUpperCase()
  const q = (searchParams.get('q') || '').toString()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get('pageSize') || '20', 10)))
  const whereStatus = status && status !== 'ALL' ? { status } : {}
  const whereSearch = q
    ? { OR: [
        { message: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q, mode: 'insensitive' } } },
      ] }
    : {}
  const where = { AND: [whereStatus, whereSearch] }
  const skip = Math.max(0, (page - 1) * pageSize)
  const [rows, total] = await Promise.all([
    prisma.changeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { user: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.changeRequest.count({ where }),
  ])
  return Response.json({ ok: true, requests: rows, total, page, pageSize })
}
