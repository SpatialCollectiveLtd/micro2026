import 'server-only'
import exifr from 'exifr'

// Host-specific tuning for Range and headers if necessary.
const hostTuning = [
  // Example: tweak for common GoPro hosting if needed in the future
  // { test: /gopro\.com|gopro-content\.com/i, rangeSize: 256 * 1024, headers: { 'User-Agent': 'Micro2026/1.0' } },
]

function pickTuning(url) {
  try {
    const u = new URL(url)
    for (const rule of hostTuning) {
      if (rule.test.test(u.hostname)) return rule
    }
  } catch {}
  return null
}

async function fetchHeadBytes(url, baseSize) {
  const tuning = pickTuning(url)
  const size = Math.max(baseSize, tuning?.rangeSize || 0)
  const rangeSize = size || baseSize
  const headers = { Range: `bytes=0-${rangeSize - 1}`, ...(tuning?.headers || {}) }
  try {
    const res = await fetch(url, { headers, cache: 'no-store' })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    return buf
  } catch {
    return null
  }
}

export async function extractGpsFromUrl(url, { firstTry = 128 * 1024, retrySize = 256 * 1024 } = {}) {
  // Try small then retry with larger window if no GPS found
  let head = await fetchHeadBytes(url, firstTry)
  if (head) {
    try {
      const gps = await exifr.gps(head)
      if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
        return { latitude: gps.latitude, longitude: gps.longitude }
      }
    } catch {}
  }
  // Retry with larger chunk
  head = await fetchHeadBytes(url, retrySize)
  if (head) {
    try {
      const gps = await exifr.gps(head)
      if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
        return { latitude: gps.latitude, longitude: gps.longitude }
      }
    } catch {}
  }
  return { latitude: null, longitude: null }
}
