import prisma from '@/lib/prisma'

// Validate that the provided session matches the user's active sessionId in DB
// Returns: { user } on success; { conflict: true } if sid mismatch; null if no user
export async function getActiveUser(session) {
  if (!session?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, role: true, sessionId: true, settlementId: true, phone: true, name: true } })
  if (!user) return null
  if (user.sessionId && user.sessionId !== session.sid) return { conflict: true }
  return { user }
}
