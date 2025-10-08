import prisma from '@/lib/prisma'
import { Table, THead, TH, TR, TD } from '@/components/ui/table'

export const dynamic = 'force-dynamic'

async function getUserAndLogs(id) {
  const [user, logs] = await Promise.all([
    prisma.user.findUnique({ where: { id }, include: { settlement: true } }),
    prisma.activityLog.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 500 }),
  ])
  return { user, logs }
}

export default async function UserDetailPage({ params }) {
  const { id } = params
  const { user, logs } = await getUserAndLogs(id)
  if (!user) return (<div className="mx-auto max-w-5xl p-4">User not found</div>)
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="text-lg font-semibold mb-2">Profile</div>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          <div><span className="text-neutral-500">Name:</span> <span className="font-medium">{user.name || '-'}</span></div>
          <div><span className="text-neutral-500">Phone:</span> <span className="font-medium">{user.phone}</span></div>
          <div><span className="text-neutral-500">Role:</span> <span className="font-medium">{user.role}</span></div>
          <div><span className="text-neutral-500">Settlement:</span> <span className="font-medium">{user.settlement?.name || '-'}</span></div>
          <div><span className="text-neutral-500">Status:</span> <span className="font-medium">{user.active ? 'Active' : 'Inactive'}</span></div>
          <div><span className="text-neutral-500">Created:</span> <span className="font-medium">{new Date(user.createdAt).toLocaleString()}</span></div>
        </div>
      </div>
      <div>
        <div className="mb-2 text-lg font-semibold">Activity</div>
        <Table>
          <THead>
            <tr>
              <TH>Time</TH>
              <TH>Type</TH>
              <TH>Meta</TH>
            </tr>
          </THead>
          <tbody>
            {logs.map(l => (
              <TR key={l.id}>
                <TD className="whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</TD>
                <TD>{l.type}</TD>
                <TD><pre className="whitespace-pre-wrap break-words text-xs">{l.meta || ''}</pre></TD>
              </TR>
            ))}
            {logs.length === 0 && (
              <TR><TD colSpan={3} className="text-sm text-neutral-500">No activity yet.</TD></TR>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
