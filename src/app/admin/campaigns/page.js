import prisma from '@/lib/prisma'
import { Table, THead, TR, TH, TD } from '@/components/ui/table'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'

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
        <Button asChild>
          <a href="/admin/campaigns/new">Create New Campaign</a>
        </Button>
      </div>

      <Table>
        <THead>
          <tr>
            <TH>Title</TH>
            <TH>Status</TH>
            <TH>Images</TH>
            <TH>Created</TH>
          </tr>
        </THead>
        <tbody>
          {campaigns.map((c) => (
            <TR key={c.id}>
              <TD className="font-medium text-neutral-800 dark:text-neutral-200">
                <a href={`/admin/campaigns/${c.id}`} className="block w-full hover:underline">{c.title}</a>
              </TD>
              <TD>
                <Badge className={c.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}>
                  {c.active ? 'Active' : 'Inactive'}
                </Badge>
              </TD>
              <TD>{c.images.length}</TD>
              <TD>{new Date(c.createdAt).toLocaleString()}</TD>
            </TR>
          ))}
          {campaigns.length === 0 && (
            <tr>
              <TD className="px-4 py-6 text-center text-neutral-500" colSpan={4}>No campaigns yet.</TD>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  )
}
