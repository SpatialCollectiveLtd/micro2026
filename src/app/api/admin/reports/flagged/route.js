import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function GET(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'
  const images = await prisma.image.findMany({ where: { status: 'FLAGGED' }, include: { campaign: true } })
  if (format === 'csv') {
    const header = ['id','url','campaign','question','status','latitude','longitude']
    const lines = [header.join(',')]
    for (const img of images) {
      lines.push([
        img.id,
        img.url,
        img.campaign?.title || '',
        img.question,
        img.status,
        img.latitude ?? '',
        img.longitude ?? '',
      ].map(v => `"${(v ?? '').toString().replace(/"/g,'""')}"`).join(','))
    }
    const csv = lines.join('\n')
    return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="flagged_images.csv"' } })
  }
  return Response.json({ ok: true, images })
}
