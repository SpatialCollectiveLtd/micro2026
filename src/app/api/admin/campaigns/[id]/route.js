import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function GET(request, { params }) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()

  const id = params.id
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      settlements: { include: { settlement: true } },
      images: true,
      tasks: true,
    },
  })
  if (!campaign) return Response.json({ ok: false, error: 'Not found' }, { status: 404 })

  // Compute derived metrics
  const totalImages = campaign.images.length
  const assignedWorkers = new Set(campaign.tasks.map(t => t.userId)).size
  const tasksCompleted = campaign.tasks.filter(t => t.completed).length
  const overallProgress = campaign.tasks.length > 0 ? Math.round((tasksCompleted / campaign.tasks.length) * 100) : 0

  // responses per image
  const responsesByImage = await prisma.response.groupBy({ by: ['taskId'], _count: { _all: true } })
  const taskIdToCount = new Map(responsesByImage.map(r => [r.taskId, r._count._all]))
  const imageResponseCounts = new Map()
  for (const t of campaign.tasks) {
    const prev = imageResponseCounts.get(t.imageId) || 0
    imageResponseCounts.set(t.imageId, prev + (taskIdToCount.get(t.id) || 0))
  }

  return Response.json({ ok: true, campaign, metrics: { totalImages, assignedWorkers, tasksCompleted, overallProgress }, imageResponseCounts: Object.fromEntries(imageResponseCounts) })
}

export async function PATCH(request, { params }) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const id = params.id
  const body = await request.json().catch(() => ({}))
  if (typeof body.active !== 'boolean') {
    return Response.json({ ok: false, error: 'active boolean required' }, { status: 400 })
  }
  const updated = await prisma.campaign.update({ where: { id }, data: { active: body.active } })
  return Response.json({ ok: true, campaign: updated })
}
