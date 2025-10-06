import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getSettlements() {
  return prisma.settlement.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
}

export default async function NewCampaignPage() {
  const settlements = await getSettlements()
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-semibold">Create Campaign</h1>
      <form action="/api/admin/campaigns" method="post" encType="multipart/form-data" className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input name="title" required className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Question</label>
          <textarea name="question" required className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Image URLs CSV</label>
          <input type="file" name="file" accept=".csv" required className="block w-full text-sm" />
          <p className="mt-1 text-xs text-neutral-500">CSV with a single image URL per line.</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Target Settlements</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {settlements.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="settlements" value={s.id} />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <a href="/admin/campaigns" className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700">Cancel</a>
          <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Create Campaign</button>
        </div>
      </form>
    </div>
  )
}
