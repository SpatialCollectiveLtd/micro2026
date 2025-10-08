import prisma from '@/lib/prisma'
import { Table, THead, TH, TR, TD } from '@/components/ui/table'
import Link from 'next/link'
import Button from '@/components/ui/button'
import React from 'react'

export const dynamic = 'force-dynamic'

async function getLogs() {
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 500 })
  return logs
}

export default async function ActivityPage() {
  const logs = await getLogs()
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Activity</h1>
        {/* Client wrapper to show generating state */}
        <ClientDownloadButton />
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
    </div>
  )
}

function ClientDownloadButton() {
  const [gen, setGen] = React.useState(false)
  return (
    <a
      href="/api/admin/reports/activity?format=csv"
      onClick={() => setGen(true)}
    >
      <Button disabled={gen}>{gen ? (<span className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Generating…</span>) : 'Download CSV'}</Button>
    </a>
  )
}
