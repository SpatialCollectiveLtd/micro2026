import prisma from '@/lib/prisma'
import { parseSessionCookie } from '@/lib/session'

export async function POST(request) {
  const session = await parseSessionCookie(request)
  if (!session?.id) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch (e) {
    return Response.json({ ok: false, error: 'Invalid body' }, { status: 400 })
  }

  const { taskId, answer } = body || {}
  if (!taskId || typeof answer !== 'boolean') {
    return Response.json({ ok: false, error: 'Missing taskId or answer' }, { status: 400 })
  }

  // Ensure task belongs to user
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { image: true } })
  if (!task || task.userId !== session.id) {
    return Response.json({ ok: false, error: 'Not found' }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.response.create({ data: { userId: session.id, taskId, answer } }),
    prisma.task.update({ where: { id: taskId }, data: { completed: true } }),
  ])

  return Response.json({ ok: true })
}
