import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function GET(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5000 })
  if (format === 'csv') {
    const header = ['createdAt','userId','type','meta']
    const lines = [header.join(',')]
    for (const l of logs) {
      lines.push([
        l.createdAt.toISOString(),
        l.userId,
        l.type,
        l.meta || '',
      ].map(v => `"${(v ?? '').toString().replace(/"/g,'""')}"`).join(','))
    }
    const csv = lines.join('\n')
    return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="activity.csv"' } })
  }
  return Response.json({ ok: true, logs })
}
