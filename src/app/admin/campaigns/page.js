import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getData() {
  const campaigns = await prisma.campaign.findMany({
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  })
  return campaigns
}

export default async function CampaignsPage() {
  const campaigns = await getData()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <a href="/admin/campaigns/new" className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Create New Campaign</a>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="px-4 py-3">{c.title}</td>
                <td className="px-4 py-3"><span className="rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">{c.active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3">{c.images.length}</td>
                <td className="px-4 py-3">{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">No campaigns yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
