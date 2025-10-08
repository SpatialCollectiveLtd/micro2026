import 'server-only'
import prisma from '@/lib/prisma'
import { extractGpsFromUrl } from '@/lib/exif'
import { parseSessionCookie } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

async function isAuthorized(request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('x-cron-secret')
  if (secret && header && header === secret) return true
  const decoded = await parseSessionCookie(request)
  return decoded?.role === 'ADMIN'
}

export async function POST(request) {
  if (!(await isAuthorized(request))) return unauthorized()

  const { searchParams } = new URL(request.url)
  const limit = Math.min(500, Math.max(1, Number(searchParams.get('limit') || '200')))

  // Select a batch of images missing GPS
  const images = await prisma.image.findMany({
    where: { OR: [{ latitude: null }, { longitude: null }] },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })

  let updated = 0
  for (const img of images) {
    const { latitude, longitude } = await extractGpsFromUrl(img.url)
    if (latitude != null && longitude != null) {
      await prisma.image.update({ where: { id: img.id }, data: { latitude, longitude } })
      updated++
    }
  }

  return Response.json({ ok: true, scanned: images.length, updated })
}
