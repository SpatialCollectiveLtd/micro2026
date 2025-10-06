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
  if (!body || typeof body.groundTruth === 'undefined') return Response.json({ ok: false, error: 'groundTruth required' }, { status: 400 })
  const updated = await prisma.image.update({ where: { id }, data: { groundTruth: body.groundTruth } })
  return Response.json({ ok: true, image: updated })
}
