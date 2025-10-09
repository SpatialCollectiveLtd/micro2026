import WorkerLayout from '@/app/(worker)/layout'
import prisma from '@/lib/prisma'
import { cookies as readCookies } from 'next/headers'
import { unsealSessionToken } from '@/lib/session'
import { getActiveUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getData(userId) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const [user, completedToday, notices] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.task.count({
      where: { userId, completed: true, createdAt: { gte: start, lte: end } },
    }),
    prisma.notice.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])
  return { user, completedToday, notices }
}

function ProgressRing({ current = 0, goal = 300 }) {
  const pct = Math.max(0, Math.min(100, Math.round((current / goal) * 100)))
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dash = (pct / 100) * circumference
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth="12"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-900 dark:fill-white text-2xl font-bold">
        {pct}%
      </text>
    </svg>
  )
}

export default async function DashboardPage() {
  // Parse sealed session cookie using iron-session
  const sessionCookie = readCookies().get('mt_session')?.value
  let session = null
  if (sessionCookie) {
    session = await unsealSessionToken(sessionCookie)
  }

  if (!session?.id) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-500">Redirecting...</p>
      </div>
    )
  }

  // Enforce single active session by validating sid against DB
  const active = await getActiveUser(session)
  if (!active) redirect('/login')
  if (active?.conflict) redirect('/session-conflict')
  if (active?.suspended) redirect('/suspended')
  const userId = active.user.id

  const { user, completedToday, notices } = await getData(userId)
  const goal = 300

  return (
    <WorkerLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div className="rounded-xl border border-black/10 bg-white/60 p-5 shadow-[0_8px_30px_rgb(0_0_0_/_0.06)] backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/60">
          <h1 className="text-xl font-semibold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Here’s your progress for today.</p>
        </div>

        {/* DailyCompletionCard */}
        <div className="flex items-center gap-6 rounded-xl border border-black/10 bg-white/60 p-5 shadow-[0_8px_30px_rgb(0_0_0_/_0.06)] backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/60">
          <div className="shrink-0">
            <ProgressRing current={completedToday} goal={goal} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-semibold tracking-tight">{completedToday} / {goal}</div>
            <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Daily completion</div>
            <Link href="/tasks" className="mt-4 inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              Start Task
            </Link>
          </div>
        </div>

        {/* NoticesFeed */}
        <div className="rounded-xl border border-black/10 bg-white/60 p-0 shadow-[0_8px_30px_rgb(0_0_0_/_0.06)] backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/60">
          <div className="border-b border-black/10 p-4 text-sm font-medium dark:border-white/10">Notices</div>
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {notices.length === 0 && (
              <li className="p-4 text-sm text-neutral-500 dark:text-neutral-400">No active notices</li>
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
