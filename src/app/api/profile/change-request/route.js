import 'server-only'
import prisma from '@/lib/prisma'
import { parseSessionCookie } from '@/lib/session'

export async function POST(request) {
  const session = await parseSessionCookie(request)
  if (!session?.id) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const message = (body?.message || '').toString().trim()
  if (!message || message.length < 5) {
    return Response.json({ ok: false, error: 'Please provide a message (min 5 characters).' }, { status: 400 })
  }

  const cr = await prisma.changeRequest.create({ data: { userId: session.id, message } })
  return Response.json({ ok: true, id: cr.id })
}
