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

export async function GET(request) {
  const decoded = requireAdmin(request)
  if (!decoded) return unauthorized()

  const campaigns = await prisma.campaign.findMany({ include: { images: true }, orderBy: { createdAt: 'desc' } })
  return Response.json({ ok: true, campaigns })
}

export async function POST(request) {
  const decoded = requireAdmin(request)
  if (!decoded) return unauthorized()

  const form = await request.formData()
  const title = (form.get('title') || '').toString().trim()
  const question = (form.get('question') || '').toString().trim()
  const file = form.get('file')
  const selectedSettlements = form.getAll('settlements').map((v) => v.toString())

  if (!title || !question || !file || selectedSettlements.length === 0) {
    return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  // Parse CSV (one URL per line)
  const text = await file.text()
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) {
    return Response.json({ ok: false, error: 'CSV is empty' }, { status: 400 })
  }

  // Create campaign, images, settlement links, and tasks for users in selected settlements
  const campaign = await prisma.campaign.create({ data: { title, question, active: true } })

  // Create images
  const images = await Promise.all(
    lines.map((url) => prisma.image.create({ data: { url, question, campaignId: campaign.id } }))
  )

  // Link settlements
  await Promise.all(
    selectedSettlements.map((sid) => prisma.campaignSettlement.create({ data: { campaignId: campaign.id, settlementId: sid } }))
  )

  // Create tasks for all users in those settlements
  const users = await prisma.user.findMany({ where: { settlementId: { in: selectedSettlements } } })
  const taskCreates = []
  for (const user of users) {
    for (const img of images) {
      taskCreates.push(prisma.task.create({ data: {
        userId: user.id,
        settlementId: user.settlementId,
        imageId: img.id,
        campaignId: campaign.id,
      } }))
    }
  }
  await prisma.$transaction(taskCreates)

  return Response.redirect(new URL('/admin/campaigns', request.url))
}
