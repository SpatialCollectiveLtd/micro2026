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

export async function GET(request) {
  const decoded = requireAdmin(request)
  if (!decoded) return unauthorized()
  const settlements = await prisma.settlement.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  return Response.json({ ok: true, settlements })
}
