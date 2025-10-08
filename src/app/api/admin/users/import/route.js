import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'

function unauthorized() { return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

// Simple CSV line splitter that supports quoted fields and commas inside quotes
function splitCSVLine(line) {
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ } // escaped quote
      else { inQuotes = !inQuotes }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  result.push(cur)
  return result
}

function parseBool(v, def = true) {
  if (v == null) return def
  const s = String(v).trim().toLowerCase()
  if (s === '') return def
  return ['1','true','yes','y'].includes(s) ? true : ['0','false','no','n'].includes(s) ? false : def
}

function sanitizeHeader(h) { return h?.trim().replace(/^\ufeff/, '').toLowerCase() }

export async function POST(request) {
  const decoded = await requireAdmin(request)
  if (!decoded) return unauthorized()

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ ok: false, error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!file || typeof file.arrayBuffer !== 'function') {
    return Response.json({ ok: false, error: 'Missing file' }, { status: 400 })
  }
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size && file.size > maxSize) {
    return Response.json({ ok: false, error: 'File too large. Max 5MB' }, { status: 413 })
  }

  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) {
    return Response.json({ ok: false, error: 'Empty CSV' }, { status: 400 })
  }
  const maxRows = 5000
  if (lines.length - 1 > maxRows) {
    return Response.json({ ok: false, error: `Too many rows. Max ${maxRows}` }, { status: 400 })
  }

  const headerCells = splitCSVLine(lines[0]).map(sanitizeHeader)
  const idx = {
    name: headerCells.indexOf('name'),
    phone: headerCells.indexOf('phone'),
    settlementName: headerCells.indexOf('settlementname'),
    role: headerCells.indexOf('role'),
    active: headerCells.indexOf('active'),
  }
  if (idx.phone === -1) {
    return Response.json({ ok: false, error: 'CSV must include a phone column' }, { status: 400 })
  }

  // Preload settlements and build a lookup by lower-cased trimmed name
  const settlements = await prisma.settlement.findMany({ select: { id: true, name: true } })
  const settlementMap = new Map()
  for (const s of settlements) settlementMap.set(s.name.trim().toLowerCase(), s.id)

  // Gather phones for duplicate checks
  const rows = []
  for (let r = 1; r < lines.length; r++) {
    const cols = splitCSVLine(lines[r])
    const get = (i) => (i >= 0 && i < cols.length) ? cols[i].trim() : ''
    rows.push({
      row: r + 1, // human-friendly line number
      name: idx.name >= 0 ? get(idx.name) : '',
      phone: idx.phone >= 0 ? get(idx.phone) : '',
      settlementName: idx.settlementName >= 0 ? get(idx.settlementName) : '',
      role: (idx.role >= 0 ? get(idx.role) : 'WORKER') || 'WORKER',
      activeRaw: idx.active >= 0 ? get(idx.active) : '',
    })
  }

  const errors = []
  const seen = new Set()
  const phones = []
  for (const row of rows) {
    const phone = row.phone.trim()
    if (!phone) { errors.push({ row: row.row, message: 'Phone required' }); continue }
    if (seen.has(phone)) { errors.push({ row: row.row, message: 'duplicate phone (within file)' }); continue }
    seen.add(phone)
    phones.push(phone)
  }

  // Check existing phones in DB
  const existing = await prisma.user.findMany({ where: { phone: { in: phones } }, select: { phone: true } })
  const existingSet = new Set(existing.map(u => u.phone))

  // Validate and prepare data
  const validData = []
  for (const row of rows) {
    const phone = row.phone.trim()
    if (!phone) continue // already errored
    if (existingSet.has(phone)) { errors.push({ row: row.row, message: 'duplicate phone' }); continue }

    const role = row.role === 'ADMIN' ? 'ADMIN' : 'WORKER'
    const active = parseBool(row.activeRaw, true)
    let settlementId = null
    if (row.settlementName) {
      const key = row.settlementName.trim().toLowerCase()
      settlementId = settlementMap.get(key) || null
      if (!settlementId) { errors.push({ row: row.row, message: 'Settlement not found' }); continue }
    }

    validData.push({ name: row.name || null, phone, role, settlementId, active })
  }

  // Insert in bulk; rely on unique constraint to avoid races
  let created = 0
  if (validData.length > 0) {
    const res = await prisma.user.createMany({ data: validData, skipDuplicates: true })
    created = res.count || 0
    // If some were skipped due to race, we don't know which; reflect in created count only
  }

  const summary = {
    ok: true,
    created,
    processed: rows.length,
    skipped: errors.length,
    errors: errors.slice(0, 50), // cap to avoid huge payloads
  }
  return Response.json(summary)
}
