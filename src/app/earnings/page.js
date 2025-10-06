import WorkerLayout from '@/app/(worker)/layout'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getUser(request) {
  const sessionCookie = request.cookies.get('mt_session')?.value
  if (!sessionCookie) return null
  try {
    const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'))
    return await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true } })
  } catch { return null }
}

export default async function EarningsPage({ request }) {
  const user = await getUser(request)
  const reports = user ? await prisma.dailyReport.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 30 }) : []
  return (
    <WorkerLayout>
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h1 className="text-xl font-semibold">Earnings</h1>
        <div className="mt-4 grid gap-2">
          {reports.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
              <div>{new Date(r.date).toLocaleDateString()}</div>
              <div className="tabular-nums">Tasks: {r.totalTasks} • Acc: {(r.accuracy*100).toFixed(0)}% • Total: {r.totalPay.toFixed(2)}</div>
            </div>
          ))}
          {reports.length === 0 && <div className="text-sm text-neutral-500">No earnings yet.</div>}
        </div>
      </div>
    </WorkerLayout>
  )
}
