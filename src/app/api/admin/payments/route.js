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

  const reports = await prisma.dailyReport.findMany({ where: { date: { gte: from, lte: to } }, include: { user: true } })
  const totalTasks = reports.reduce((s, r) => s + r.totalTasks, 0)
  const totalPaid = reports.reduce((s, r) => s + r.totalPay, 0)

  if (format === 'csv') {
    const header = ['date','userPhone','role','totalTasks','correct','accuracy','basePay','bonusPay','totalPay']
    const lines = [header.join(',')]
    for (const r of reports) {
      lines.push([
        r.date.toISOString().slice(0,10),
        r.user?.phone || '',
        r.user?.role || '',
        r.totalTasks,
        r.correct,
        r.accuracy,
        r.basePay.toFixed(2),
        r.bonusPay.toFixed(2),
        r.totalPay.toFixed(2),
      ].map(v => `"${(v ?? '').toString().replace(/"/g,'""')}"`).join(','))
    }
    const csv = lines.join('\n')
    return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="payments.csv"' } })
  }

  return Response.json({ ok: true, summary: { totalTasks, rate, totalPaid } })
}
