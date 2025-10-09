import 'server-only'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { extractGpsFromUrl } from '@/lib/exif'

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
  // Validate URLs and collect duplicates (preserve order of first occurrence)
  const seen = new Map() // url -> firstIndex
  const validUrls = []
  const duplicates = []
  let invalidCount = 0
  lines.forEach((raw, idx) => {
    try {
      const u = new URL(raw)
      const normalized = u.toString()
      if (seen.has(normalized)) {
        duplicates.push({ url: normalized, firstIndex: seen.get(normalized), duplicateIndex: idx })
      } else {
        seen.set(normalized, idx)
        validUrls.push(normalized)
      }
    } catch {
      invalidCount++
    }
  })
  if (validUrls.length === 0) {
    return Response.json({ ok: false, error: 'No valid URLs found in CSV', duplicates, invalid: invalidCount }, { status: 400 })
  }

  // Create campaign, images, settlement links, and tasks for users in selected settlements
  // If duplicates detected, short‑circuit to let admin decide (skip creating campaign now)
  if (duplicates.length) {
    return Response.json({ ok: false, error: 'Duplicate image URLs detected', duplicates, invalid: invalidCount }, { status: 409 })
  }

  const campaign = await prisma.campaign.create({ data: { title, question, active: true } })

  // Helper to chunk arrays
  const chunk = (arr, size) => {
    const out = []
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
    return out
  }

  // Check if GPS columns exist to avoid failing on environments where ensure not yet run
  async function imagesGpsColumnsExist() {
    try {
      const rows = await prisma.$queryRawUnsafe(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'images' AND COLUMN_NAME IN ('latitude','longitude')"
      )
      const cols = new Set((rows || []).map((r) => r.COLUMN_NAME))
      return cols.has('latitude') && cols.has('longitude')
    } catch {
      return false
    }
  }
  const hasGpsCols = await imagesGpsColumnsExist()

  // Create images with optional EXIF GPS. Bounded concurrency per batch to limit load.
  const images = []
  let sequence = 1
  for (const group of chunk(validUrls, 100)) {
    const created = await Promise.all(
      group.map(async (url) => {
        const { latitude: lat, longitude: lon } = await extractGpsFromUrl(url)
        const data = hasGpsCols
          ? { url, question, campaignId: campaign.id, latitude: lat, longitude: lon, sequence: sequence++ }
          : { url, question, campaignId: campaign.id, sequence: sequence++ }
        return prisma.image.create({ data })
      })
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
    await prisma.task.createMany({ data: group, skipDuplicates: true })
  }

  const message = `Campaign created with ${images.length} valid images.${invalidCount ? ` ${invalidCount} invalid URL(s) were skipped.` : ''}`
  return Response.json({ ok: true, campaignId: campaign.id, images: images.length, invalid: invalidCount, message, duplicates: [] })
}
