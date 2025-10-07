import prisma from '@/lib/prisma'
import { parseSessionCookie } from '@/lib/session'

export async function GET(request) {
  const session = await parseSessionCookie(request)
  if (!session?.id) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findFirst({
    where: { userId: session.id, completed: false, image: { active: true, campaign: { archived: false } } },
    orderBy: { createdAt: 'asc' },
    include: { image: true },
  })

  if (!task) return Response.json({ ok: true, task: null })

  // mark served time if not yet set
  if (!task.servedAt) {
    await prisma.task.update({ where: { id: task.id }, data: { servedAt: new Date() } })
  }

  return Response.json({ ok: true, task })
}
