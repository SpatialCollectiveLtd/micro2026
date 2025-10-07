import { sealData, unsealData } from 'iron-session/edge'

const password = process.env.SESSION_SECRET || 'dev-secret-change-me'
const ttl = 60 * 60 * 24 * 7 // 7 days

// Create a Set-Cookie header value for our sealed session token
export async function createSessionCookie(data) {
  const sealed = await sealData(data, { password, ttl })
  const base = `mt_session=${sealed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttl}`
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return base + secure
}

// Low-level helper to unseal a token string
export async function unsealSessionToken(token) {
  if (!token) return null
  try {
    return await unsealData(token, { password })
  } catch {
    return null
  }
}

// Generic helper for API Routes to parse the cookie from a NextRequest
export async function parseSessionCookie(request) {
  const raw = request.cookies?.get?.('mt_session')?.value || request.headers?.get?.('cookie') || ''
  const match = typeof raw === 'string' ? raw.match(/mt_session=([^;]+)/) : null
  const token = match ? match[1] : (typeof raw === 'string' ? raw : null)
  if (!token) return null
  return await unsealSessionToken(token)
}

// Simple admin guard for API routes
export async function requireAdmin(request) {
  const session = await parseSessionCookie(request)
  if (!session || session.role !== 'ADMIN') return null
  return session
}
