import prisma from '@/lib/prisma'

export async function getWorkingHours() {
  const rows = await prisma.setting.findMany({ where: { key: { in: ['working_hours_start', 'working_hours_end'] } } })
  const map = new Map(rows.map(r => [r.key, r.value]))
  const start = map.get('working_hours_start') || null
  const end = map.get('working_hours_end') || null
  return { start, end }
}

export function parseHHmm(str) {
  if (!str) return null
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(str)
  if (!m) return null
  const h = Number(m[1]); const mm = Number(m[2])
  return h * 60 + mm
}

export function isNowWithinWindow(startHHmm, endHHmm, now = new Date()) {
  const s = parseHHmm(startHHmm)
  const e = parseHHmm(endHHmm)
  if (s == null || e == null) return true // unrestricted if not configured
  const mins = now.getHours() * 60 + now.getMinutes()
  if (s <= e) {
    return mins >= s && mins <= e
  }
  // If window wraps past midnight (e.g., 22:00 - 06:00)
  return mins >= s || mins <= e
}

export async function upsertWorkingHours(start, end) {
  if (start != null) {
    await prisma.setting.upsert({ where: { key: 'working_hours_start' }, create: { key: 'working_hours_start', value: start }, update: { value: start } })
  }
  if (end != null) {
    await prisma.setting.upsert({ where: { key: 'working_hours_end' }, create: { key: 'working_hours_end', value: end }, update: { value: end } })
  }
}
