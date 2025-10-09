import prisma from '@/lib/prisma'
import { Table, THead, TH, TR, TD } from '@/components/ui/table'
import Link from 'next/link'
import ClientDownloadButton from './ClientDownloadButton'
import PurgeLogsButton from './PurgeLogsButton'

export const dynamic = 'force-dynamic'

async function getLogs({ page, pageSize }) {
  const skip = Math.max(0, (page - 1) * pageSize)
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.activityLog.count(),
  ])
  return { logs, total }
}

export default async function ActivityPage({ searchParams }) {
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10))
  const pageSize = Math.min(200, Math.max(20, parseInt(searchParams?.pageSize || '50', 10)))
  const { logs, total } = await getLogs({ page, pageSize })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Activity</h1>
  {/* Client wrapper to show generating state */}
  <ClientDownloadButton />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Page {page} of {totalPages} • {total} total</div>
        <PurgeLogsButton />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <Table>
          <THead>
            <tr>
              <TH>Time</TH>
              <TH>User</TH>
              <TH>Type</TH>
              <TH>Meta</TH>
            </tr>
          </THead>
          <tbody>
            {logs.map(l => (
              <TR key={l.id}>
                <TD>{new Date(l.createdAt).toLocaleString()}</TD>
                <TD>{l.userId}</TD>
                <TD>{l.type}</TD>
                <TD className="max-w-[500px] truncate">{l.meta}</TD>
              </TR>
            ))}
            {logs.length === 0 && (
              <TR>
                <TD colSpan={4} className="text-center text-neutral-500">No activity</TD>
              </TR>
            )}
          </tbody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          {page > 1 && (
            <a className="rounded border px-3 py-1" href={`?page=${page-1}&pageSize=${pageSize}`}>Previous</a>
          )}
          {page < totalPages && (
            <a className="rounded border px-3 py-1" href={`?page=${page+1}&pageSize=${pageSize}`}>Next</a>
          )}
        </div>
      </div>
    </div>
  )
}

// ClientDownloadButton moved to a client component file
