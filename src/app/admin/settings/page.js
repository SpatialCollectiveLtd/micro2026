import prisma from '@/lib/prisma'
import WorkerLayout from '@/app/(worker)/layout'

export const dynamic = 'force-dynamic'

async function getSettings() {
  const rows = await prisma.setting.findMany({ where: { key: { in: ['working_hours_start', 'working_hours_end'] } } })
  const map = new Map(rows.map(r => [r.key, r.value]))
  return { start: map.get('working_hours_start') || '', end: map.get('working_hours_end') || '' }
}

export default async function AdminSettingsPage() {
  const { start, end } = await getSettings()
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Admin Settings</h1>
      <form action="/api/admin/settings" method="post" className="space-y-4 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/60">
        <div>
          <label className="block text-sm font-medium">Working hours start (HH:mm)</label>
          <input name="start" defaultValue={start} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
        </div>
        <div>
          <label className="block text-sm font-medium">Working hours end (HH:mm)</label>
          <input name="end" defaultValue={end} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
        </div>
        <div className="flex items-center justify-end">
          <button className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-200 dark:text-neutral-900">Save</button>
        </div>
      </form>
    </div>
  )
}
