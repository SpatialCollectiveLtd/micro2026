import { sealData, unsealData } from 'iron-session/edge'

const password = process.env.SESSION_SECRET || 'dev-secret-change-me'
const ttl = 60 * 60 * 24 * 7 // 7 days

export async function createSessionCookie(data) {
  const sealed = await sealData(data, { password, ttl })
  return `mt_session=${sealed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttl}`
}

export async function parseSessionCookie(request) {
  const raw = request.cookies?.get?.('mt_session')?.value || request.headers?.get?.('cookie') || ''
  const match = typeof raw === 'string' ? raw.match(/mt_session=([^;]+)/) : null
  const token = match ? match[1] : (typeof raw === 'string' ? raw : null)
  if (!token) return null
  try {
    const data = await unsealData(token, { password })
    return data
  } catch {
    return null
  }
}
