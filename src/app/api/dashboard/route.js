import prisma from '@/lib/prisma'
import { parseSessionCookie } from '@/lib/session'

export async function GET(request) {
  const session = await parseSessionCookie(request)
  if (!session?.id) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, phone: true, role: true, settlementId: true } })
  if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const start = new Date(); start.setHours(0,0,0,0)
  const end = new Date(); end.setHours(23,59,59,999)

  const [completedToday, notices] = await Promise.all([
    prisma.task.count({ where: { userId: user.id, completed: true, createdAt: { gte: start, lte: end } } }),
    prisma.notice.findMany({
      where: {
        active: true,
        OR: [
          { allUsers: true },
          { settlements: { some: { settlementId: user.settlementId || '' } } },
          { userId: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return Response.json({ ok: true, user, completedToday, notices })
}
