import prisma from '@/lib/prisma'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }
function requireAdmin(request) {
  const session = request.cookies.get('mt_session')?.value
  if (!session) return null
  try {
    const decoded = JSON.parse(Buffer.from(session, 'base64').toString('utf8'))
    if (decoded.role !== 'ADMIN') return null
    return decoded
  } catch { return null }
}

export async function PATCH(request, { params }) {
  const decoded = requireAdmin(request)
  if (!decoded) return unauthorized()
  const id = params.id
  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  const { name, role, settlementId, active } = body
  const data = {}
  if (typeof name !== 'undefined') data.name = name?.trim() || null
  if (typeof role !== 'undefined') {
    if (!['WORKER', 'ADMIN'].includes(role)) return Response.json({ ok: false, error: 'Invalid role' }, { status: 400 })
    data.role = role
  }
  if (typeof settlementId !== 'undefined') data.settlementId = settlementId || null
  if (typeof active !== 'undefined') data.active = !!active
  try {
    const user = await prisma.user.update({ where: { id }, data })
    return Response.json({ ok: true, user })
  } catch {
    return Response.json({ ok: false, error: 'Update failed' }, { status: 400 })
  }
}

export async function DELETE(request, { params }) {
  const decoded = requireAdmin(request)
  if (!decoded) return unauthorized()
  const id = params.id
  try {
    await prisma.user.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false, error: 'Delete failed' }, { status: 400 })
  }
}
