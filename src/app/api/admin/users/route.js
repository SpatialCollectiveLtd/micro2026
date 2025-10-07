import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function GET(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone') || undefined
    const role = searchParams.get('role') || undefined
    const settlementId = searchParams.get('settlementId') || undefined
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(5, Number(searchParams.get('pageSize') || '20')))
    const sort = searchParams.get('sort') || 'createdAt:desc'
    const [sortField, sortDir] = sort.split(':')

  const where = {
    ...(phone ? { phone: { contains: phone } } : {}),
    ...(role ? { role } : {}),
    ...(settlementId ? { settlementId } : {}),
  }
    const orderBy = {}
    if (['name','phone','role','createdAt'].includes(sortField)) orderBy[sortField] = sortDir === 'asc' ? 'asc' : 'desc'
    else orderBy['createdAt'] = 'desc'

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, include: { settlement: true }, orderBy, skip: (page-1)*pageSize, take: pageSize })
    ])
    return Response.json({ ok: true, users, page, pageSize, total })
}

export async function POST(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  const { name, phone, role = 'WORKER', settlementId, active = true } = body
  if (!phone) return Response.json({ ok: false, error: 'Phone required' }, { status: 400 })
  if (!['WORKER', 'ADMIN'].includes(role)) return Response.json({ ok: false, error: 'Invalid role' }, { status: 400 })
  const data = { name: name?.trim() || null, phone: phone.trim(), role, settlementId: settlementId || null, active }
  try {
    const user = await prisma.user.create({ data })
    return Response.json({ ok: true, user })
  } catch (e) {
    return Response.json({ ok: false, error: 'Create failed' }, { status: 400 })
  }
}
