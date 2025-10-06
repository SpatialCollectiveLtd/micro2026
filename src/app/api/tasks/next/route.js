import prisma from '@/lib/prisma'

export async function GET(request) {
  const sessionCookie = request.cookies.get('mt_session')?.value
  if (!sessionCookie) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  let userId
  try {
    const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'))
    userId = decoded.id
  } catch (e) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const task = await prisma.task.findFirst({
    where: { userId, completed: false, image: { active: true } },
    orderBy: { createdAt: 'asc' },
    include: { image: true },
  })

  if (!task) return Response.json({ ok: true, task: null })

  return Response.json({ ok: true, task })
}
