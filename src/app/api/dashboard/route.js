import prisma from '@/lib/prisma'

export async function GET(request) {
  const sessionCookie = request.cookies.get('mt_session')?.value
  if (!sessionCookie) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  let user
  try {
    const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'))
    user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, phone: true, role: true, settlementId: true } })
  } catch (e) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const start = new Date(); start.setHours(0,0,0,0)
  const end = new Date(); end.setHours(23,59,59,999)

  const [completedToday, notices] = await Promise.all([
    prisma.task.count({ where: { userId: user.id, completed: true, createdAt: { gte: start, lte: end } } }),
    prisma.notice.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  return Response.json({ ok: true, user, completedToday, notices })
}
