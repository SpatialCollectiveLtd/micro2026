import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

export async function GET(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()

  const campaigns = await prisma.campaign.findMany({ include: { images: true }, orderBy: { createdAt: 'desc' } })
  return Response.json({ ok: true, campaigns })
}

export async function POST(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()

  const form = await request.formData()
  const title = (form.get('title') || '').toString().trim()
  const question = (form.get('question') || '').toString().trim()
  const file = form.get('file')
  const selectedSettlements = form.getAll('settlements').map((v) => v.toString())

  if (!title || !question || !file || selectedSettlements.length === 0) {
    return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  // Parse CSV (one URL per line) with validation and caps
  const text = await file.text()
  let lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) {
    return Response.json({ ok: false, error: 'CSV is empty' }, { status: 400 })
  }
  const MAX_LINES = 10000
  if (lines.length > MAX_LINES) {
    return Response.json({ ok: false, error: `CSV too large. Max ${MAX_LINES} URLs per upload.` }, { status: 400 })
  }
  // Validate URLs and dedupe
  const urlSet = new Set()
  const validUrls = []
  for (const raw of lines) {
    try {
      const u = new URL(raw)
      const normalized = u.toString()
      if (!urlSet.has(normalized)) {
        urlSet.add(normalized)
        validUrls.push(normalized)
      }
    } catch {
      // skip invalid URL
    }
  }
  if (validUrls.length === 0) {
    return Response.json({ ok: false, error: 'No valid URLs found in CSV' }, { status: 400 })
  }

  // Create campaign, images, settlement links, and tasks for users in selected settlements
  const campaign = await prisma.campaign.create({ data: { title, question, active: true } })

  // Helper to chunk arrays
  const chunk = (arr, size) => {
    const out = []
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
    return out
  }

  // Create images in moderate concurrency batches to avoid overwhelming DB
  const images = []
  for (const group of chunk(validUrls, 200)) {
    const created = await Promise.all(
      group.map((url) => prisma.image.create({ data: { url, question, campaignId: campaign.id } }))
    )
    images.push(...created)
  }

  // Link settlements
  await Promise.all(
    selectedSettlements.map((sid) => prisma.campaignSettlement.create({ data: { campaignId: campaign.id, settlementId: sid } }))
  )

  // Create tasks for all users in those settlements
  const users = await prisma.user.findMany({ where: { settlementId: { in: selectedSettlements } } })
  // Build task rows
  const rows = []
  for (const user of users) {
    for (const img of images) {
      rows.push({
        userId: user.id,
        settlementId: user.settlementId,
        imageId: img.id,
        campaignId: campaign.id,
      })
    }
  }
  // Batch insert tasks using createMany in chunks to avoid timeouts
  for (const group of chunk(rows, 1000)) {
    await prisma.task.createMany({ data: group })
  }

  return Response.redirect(new URL('/admin/campaigns', request.url))
}
