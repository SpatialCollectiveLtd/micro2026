import WorkerLayout from '@/app/(worker)/layout'
import prisma from '@/lib/prisma'
import { cookies as readCookies } from 'next/headers'
import { unsealSessionToken } from '@/lib/session'

export const dynamic = 'force-dynamic'

async function getMessages(user) {
  return prisma.notice.findMany({
    where: {
      active: true,
      OR: [
        { allUsers: true },
        { settlements: { some: { settlementId: user.settlementId || '' } } },
        { userId: user.id },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export default async function MessagesPage() {
  const sessionCookie = readCookies().get('mt_session')?.value
  const decoded = sessionCookie ? await unsealSessionToken(sessionCookie) : null
  if (!decoded?.id) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-500">Redirecting...</p>
      </div>
    )
  }
  const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, settlementId: true } })
  const notices = await getMessages(user)

  return (
    <WorkerLayout>
      <div className="space-y-4">
        <div className="sticky top-0 z-10 rounded-xl border border-neutral-200 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="text-lg font-semibold">Messages</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <ul className="max-h-[70dvh] overflow-auto divide-y divide-neutral-200 dark:divide-neutral-800">
            {notices.length === 0 && (
              <li className="p-4 text-sm text-neutral-500 dark:text-neutral-400">No messages</li>
            )}
            {notices.map((n) => (
              <li key={n.id} className="p-4">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{n.message}</div>
                <div className="mt-2 text-xs text-neutral-400">{new Date(n.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WorkerLayout>
  )
}
