import prisma from '@/lib/prisma'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('x-cron-secret')
  if (secret && header && header === secret) return true
  // Allow admin cookie as a fallback manual trigger by super-admins
  const session = request.cookies.get('mt_session')?.value
  if (!session) return false
  try {
    const decoded = JSON.parse(Buffer.from(session, 'base64').toString('utf8'))
    return decoded.role === 'ADMIN'
  } catch { return false }
}

export async function POST(request) {
  if (!isAuthorized(request)) return unauthorized()

  // Define the window: yesterday 18:00 to today 18:00 or simply "today"
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  // Consensus: compute majority per image based on today's responses
  const responses = await prisma.response.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { task: true },
  })
  const byImage = new Map()
  for (const r of responses) {
    const imgId = r.task.imageId
    const cur = byImage.get(imgId) || { yes: 0, no: 0 }
    if (r.answer) cur.yes++
    else cur.no++
    byImage.set(imgId, cur)
  }
  const updates = []
  for (const [imageId, counts] of byImage.entries()) {
    if (counts.yes + counts.no === 0) continue
    const truth = counts.yes >= counts.no
    updates.push(prisma.image.update({ where: { id: imageId }, data: { groundTruth: truth } }))
  }
  if (updates.length) await prisma.$transaction(updates)

  // Re-load ground truths for involved images
  const imageTruth = new Map()
  if (updates.length) {
    const imageIds = Array.from(byImage.keys())
    const imgs = await prisma.image.findMany({ where: { id: { in: imageIds } }, select: { id: true, groundTruth: true } })
    for (const i of imgs) imageTruth.set(i.id, i.groundTruth)
  }

  // Payment: compute per user accuracy for today, then pay
  const byUser = new Map()
  for (const r of responses) {
    const truth = imageTruth.get(r.task.imageId)
    if (typeof truth === 'undefined' || truth === null) continue
    const u = byUser.get(r.userId) || { total: 0, correct: 0 }
    u.total++
    if (r.answer === truth) u.correct++
    byUser.set(r.userId, u)
  }

  const baseRate = Number(process.env.PAY_PER_TASK || '0')
  const bonusRates = {
    // Simple tiering: >=90% +50% bonus, >=75% +20% bonus, else 0%
    high: 0.5,
    mid: 0.2,
    low: 0,
  }

  const reportJobs = []
  for (const [userId, stats] of byUser.entries()) {
    if (stats.total === 0) continue
    const accuracy = stats.correct / stats.total
    const basePay = +(stats.total * baseRate).toFixed(2)
    const tier = accuracy >= 0.9 ? 'high' : accuracy >= 0.75 ? 'mid' : 'low'
    const bonusPay = +(basePay * bonusRates[tier]).toFixed(2)
    const totalPay = +(basePay + bonusPay).toFixed(2)

    // Upsert DailyReport by user+date
    const dateOnly = new Date(start)
    reportJobs.push(
      prisma.dailyReport.upsert({
        where: { userId_date: { userId, date: dateOnly } },
        update: { totalTasks: stats.total, correct: stats.correct, accuracy, basePay, bonusPay, totalPay },
        create: { userId, date: dateOnly, totalTasks: stats.total, correct: stats.correct, accuracy, basePay, bonusPay, totalPay },
      })
    )
  }
  if (reportJobs.length) await prisma.$transaction(reportJobs)

  return Response.json({ ok: true, updatedImages: updates.length, userReports: reportJobs.length })
}
