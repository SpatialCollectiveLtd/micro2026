import prisma from '@/lib/prisma'
import { requireAdminSession } from '@/lib/route-guards'
import ClientActions from './ClientActions'

export const dynamic = 'force-dynamic'

async function getRequests({ status, q, page, pageSize }) {
  const whereStatus = status && status !== 'ALL' ? { status } : {}
  const whereSearch = q
    ? { OR: [
        { message: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q, mode: 'insensitive' } } },
      ] }
    : {}
  const where = { AND: [whereStatus, whereSearch] }
  const skip = Math.max(0, (page - 1) * pageSize)
  const [rows, total] = await Promise.all([
    prisma.changeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { user: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.changeRequest.count({ where }),
  ])
  return { rows, total }
}

function StatusBadge({ status }) {
  const s = status || 'OPEN'
  const color = s === 'RESOLVED' ? 'bg-green-600 text-white' : s === 'IN_PROGRESS' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'
  return <span className={`rounded px-2 py-0.5 text-xs ${color}`}>{s.replace('_', ' ')}</span>
}

export default async function ChangeRequestsPage({ searchParams }) {
  await requireAdminSession()
  const status = (searchParams?.status || 'OPEN').toString().toUpperCase()
  const q = (searchParams?.q || '').toString()
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10))
  const pageSize = Math.min(100, Math.max(10, parseInt(searchParams?.pageSize || '20', 10)))
  const { rows, total } = await getRequests({ status, q, page, pageSize })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Change Requests</h1>
        <form className="flex items-center gap-2 text-sm">
          <input name="q" defaultValue={q} placeholder="Search message, name, phone" className="rounded border px-3 py-1 bg-transparent" />
          <input type="hidden" name="status" value={status} />
          <button className="rounded border px-3 py-1">Search</button>
        </form>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {['OPEN','IN_PROGRESS','RESOLVED','ALL'].map(s => {
          const url = new URL('http://d/_') // dummy origin for URL API
          url.pathname = '/admin/change-requests'
          url.searchParams.set('status', s)
          if (q) url.searchParams.set('q', q)
          url.searchParams.set('page', '1')
          url.searchParams.set('pageSize', String(pageSize))
          return (
            <a key={s} href={url.pathname + url.search} className={`rounded border px-3 py-1 ${status===s?'bg-neutral-200 dark:bg-neutral-800':''}`}>{s.replace('_',' ')}</a>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left dark:border-neutral-800 dark:bg-neutral-900">
              <th className="p-3">Time</th>
              <th className="p-3">User</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Message</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-neutral-500">No requests</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.id} className="border-b border-neutral-100 dark:border-neutral-800">
                <td className="p-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3">{r.user?.name || r.userId}</td>
                <td className="p-3">{r.user?.phone || '—'}</td>
                <td className="p-3 max-w-[420px]"><div className="line-clamp-3 whitespace-pre-wrap">{r.message}</div></td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-right"><ClientActions id={r.id} status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Page {page} of {totalPages} • {total} total</div>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <a className="rounded border px-3 py-1" href={`?status=${status}&q=${encodeURIComponent(q)}&page=${page-1}&pageSize=${pageSize}`}>Previous</a>
          )}
          {page < totalPages && (
            <a className="rounded border px-3 py-1" href={`?status=${status}&q=${encodeURIComponent(q)}&page=${page+1}&pageSize=${pageSize}`}>Next</a>
          )}
        </div>
      </div>
    </div>
  )
}
