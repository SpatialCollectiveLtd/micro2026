import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function POST(request, { params }) {
  const session = await requireAdmin(request)
  if (!session) return unauthorized()
  const id = params?.id
  if (!id) return Response.json({ ok: false, error: 'Missing id' }, { status: 400 })
  const form = await request.formData()
  const next = (form.get('status') || '').toString().toUpperCase()
  if (!['OPEN','IN_PROGRESS','RESOLVED'].includes(next)) {
    return Response.json({ ok: false, error: 'Invalid status' }, { status: 400 })
  }
  try {
    const updated = await prisma.changeRequest.update({ where: { id }, data: { status: next } })
    // log admin action
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        type: 'CHANGE_REQUEST_STATUS',
        meta: JSON.stringify({ id, status: next }),
      },
    })
  } catch (e) {
    return Response.json({ ok: false, error: 'Not found' }, { status: 404 })
  }
  // Redirect back to referrer if available, else to list
  const referer = request.headers.get('referer') || '/admin/change-requests'
  return Response.redirect(referer)
}
