import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { unsealSessionToken } from '@/lib/session'
import prisma from '@/lib/prisma'

async function getSessionFromCookies() {
  const jar = cookies()
  const token = jar.get('mt_session')?.value
  if (!token) return null
  return await unsealSessionToken(token)
}

export async function requireValidSession() {
  const session = await getSessionFromCookies()
  if (!session?.id) redirect('/login')
  // Validate against DB to enforce single active session
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { sessionId: true, role: true, active: true } })
  if (!user) redirect('/login')
  if (user.sessionId && user.sessionId !== session.sid) redirect('/session-conflict')
  if (user.active === false) redirect('/suspended')
  return { session, user }
}

export async function requireAdminSession() {
  const { session, user } = await requireValidSession()
  if (user.role !== 'ADMIN') redirect('/dashboard')
  return { session, user }
}
