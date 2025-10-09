import prisma from '@/lib/prisma'
import { parseSessionCookie } from '@/lib/session'
import { getWorkingHours, isNowWithinWindow } from '@/lib/settings'

function startOfToday() {
  const d = new Date()
  d.setHours(0,0,0,0)
  return d
}

export async function GET(request) {
  const session = await parseSessionCookie(request)
  if (!session?.id) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const DAILY_TARGET = Number(process.env.DAILY_TARGET || '300')
  const todayStart = startOfToday()
  const completedToday = await prisma.task.count({ where: { userId: session.id, completed: true, answeredAt: { gte: todayStart } } })

  // Working hours check (workers only): if outside, return 403 with message
  try {
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { role: true } })
    if (user?.role !== 'ADMIN') {
      const { start, end } = await getWorkingHours()
      if (!isNowWithinWindow(start, end)) {
        return Response.json({ ok: false, error: `Work is currently available only between ${start || 'start'} and ${end || 'end'}.` }, { status: 403 })
      }
    }
  } catch {}

  const task = await prisma.task.findFirst({
    where: { userId: session.id, completed: false, image: { active: true, campaign: { archived: false } } },
    orderBy: { createdAt: 'asc' },
    include: { image: true },
  })

  if (!task) {
    return Response.json({ ok: true, task: null, noneRemaining: true, progress: { completedToday, dailyTarget: DAILY_TARGET } })
  }

  // mark served time if not yet set
  if (!task.servedAt) {
    await prisma.task.update({ where: { id: task.id }, data: { servedAt: new Date() } })
  }

  return Response.json({ ok: true, task, progress: { completedToday, dailyTarget: DAILY_TARGET }, noneRemaining: false })
}
