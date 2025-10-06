import prisma from '@/lib/prisma'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }
function requireAdmin(request) {
  const session = request.cookies.get('mt_session')?.value
  if (!session) return null
  try {
    const decoded = JSON.parse(Buffer.from(session, 'base64').toString('utf8'))
    if (decoded.role !== 'ADMIN') return null
    return decoded
  } catch { return null }
}

function parseDate(value) {
  const d = new Date(value)
  return isNaN(d) ? null : d
}

export async function GET(request) {
  const decoded = requireAdmin(request)
  if (!decoded) return unauthorized()
  const { searchParams } = new URL(request.url)
  const from = parseDate(searchParams.get('from'))
  const to = parseDate(searchParams.get('to'))
  const format = searchParams.get('format') || 'json'
  const rate = Number(process.env.PAY_PER_TASK || '0')
  if (!from || !to) return Response.json({ ok: false, error: 'Invalid date range' }, { status: 400 })

  const tasks = await prisma.task.findMany({ where: { completed: true, updatedAt: { gte: from, lte: to } }, include: { user: true, image: true, settlement: true } })
  const totalTasks = tasks.length
  const totalPaid = +(totalTasks * rate).toFixed(2)

  if (format === 'csv') {
    const header = ['taskId','userPhone','role','settlement','imageUrl','updatedAt','amount']
    const lines = [header.join(',')]
    for (const t of tasks) {
      const amount = rate.toFixed(2)
      lines.push([t.id, t.user.phone, t.user.role, t.settlement?.name || '', t.image?.url || '', t.updatedAt.toISOString(), amount].map(v => `"${(v ?? '').toString().replace(/"/g,'""')}"`).join(','))
    }
    const csv = lines.join('\n')
    return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="payments.csv"' } })
  }

  return Response.json({ ok: true, summary: { totalTasks, rate, totalPaid } })
}
