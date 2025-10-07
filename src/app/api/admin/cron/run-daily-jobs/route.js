import prisma from '@/lib/prisma'
import { parseSessionCookie } from '@/lib/session'
import { computeConsensus } from '@/lib/consensus'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

async function isAuthorized(request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('x-cron-secret')
  if (secret && header && header === secret) return true
  // Allow admin cookie as a fallback manual trigger by super-admins
  const decoded = await parseSessionCookie(request)
  return decoded?.role === 'ADMIN'
}

export async function POST(request) {
  if (!(await isAuthorized(request))) return unauthorized()

  // Define the window: yesterday 18:00 to today 18:00 or simply "today"
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  // Consensus: compute grounded truth per image using a >=70% threshold over today's responses
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
    const { truth } = computeConsensus(counts)
    if (truth !== null) {
      updates.push(prisma.image.update({ where: { id: imageId }, data: { groundTruth: truth, status: 'COMPLETE' } }))
    } else {
      updates.push(prisma.image.update({ where: { id: imageId }, data: { status: 'FLAGGED' } }))
    }
  }
  if (updates.length) await prisma.$transaction(updates)

  // Load ground truths for all involved images (including ones not updated today)
  const imageTruth = new Map()
  if (byImage.size) {
    const imageIds = Array.from(byImage.keys())
    const imgs = await prisma.image.findMany({ where: { id: { in: imageIds } }, select: { id: true, groundTruth: true, status: true } })
    for (const i of imgs) imageTruth.set(i.id, { truth: i.groundTruth, status: i.status })
  }

  // Payment: compute per user accuracy for today, then pay
  const byUser = new Map()
  for (const r of responses) {
    const imgInfo = imageTruth.get(r.task.imageId) || { truth: null, status: 'PENDING' }
    const truth = imgInfo.truth
    const u = byUser.get(r.userId) || { total: 0, correct: 0 }
    // Count every response toward total
    u.total++
    // Flagged (no consensus) count as correct for fairness
    if (truth === null || typeof truth === 'undefined' || imgInfo.status === 'FLAGGED') {
      u.correct++
    } else if (r.answer === truth) {
      u.correct++
    }
    byUser.set(r.userId, u)
  }

  // Base pay is fixed if worker meets daily target, otherwise 0
  const DAILY_TARGET = Number(process.env.DAILY_TARGET || '300')
  const BASE_PAY = Number(process.env.BASE_PAY || '760')
  // Payment bonus tiers per spec:
  // 90%+ => 30%, 80-89% => 20%, 70-79% => 10%, else 0%

  const reportJobs = []
  for (const [userId, stats] of byUser.entries()) {
    if (stats.total === 0) continue
    const accuracy = stats.correct / stats.total
    const basePay = stats.total >= DAILY_TARGET ? BASE_PAY : 0
    let bonusPct = 0
    if (accuracy >= 0.9) bonusPct = 0.3
    else if (accuracy >= 0.8) bonusPct = 0.2
    else if (accuracy >= 0.7) bonusPct = 0.1
    const bonusPay = +(basePay * bonusPct).toFixed(2)
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
