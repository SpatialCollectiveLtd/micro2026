import 'server-only'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function POST(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()

  let updated = 0
  const campaigns = await prisma.campaign.findMany({ select: { id: true } })
  for (const c of campaigns) {
    const max = await prisma.image.aggregate({ _max: { sequence: true }, where: { campaignId: c.id } })
    let seq = Number(max?._max?.sequence || 0)
    const images = await prisma.image.findMany({
      where: { campaignId: c.id, sequence: 0 },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true },
    })
    for (const img of images) {
      seq += 1
      await prisma.image.update({ where: { id: img.id }, data: { sequence: seq } })
      updated++
    }
  }
  return Response.json({ ok: true, updated })
}
