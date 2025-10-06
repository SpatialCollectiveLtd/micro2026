import prisma from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import CampaignActiveToggle from '@/components/CampaignActiveToggle'
import { Table, THead, TH, TR, TD } from '@/components/ui/table'

export const dynamic = 'force-dynamic'

async function getCampaign(id) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      settlements: { include: { settlement: true } },
      images: true,
      tasks: true,
    },
  })
  if (!campaign) return null

  const totalImages = campaign.images.length
  const assignedWorkers = new Set(campaign.tasks.map(t => t.userId)).size
  const tasksCompleted = campaign.tasks.filter(t => t.completed).length
  const overallProgress = campaign.tasks.length > 0 ? Math.round((tasksCompleted / campaign.tasks.length) * 100) : 0

  // Build responses counts per image
  const responses = await prisma.response.groupBy({ by: ['taskId'], _count: { _all: true } })
  const taskIdToCount = new Map(responses.map(r => [r.taskId, r._count._all]))
  const imageResponseCounts = Object.fromEntries(
    campaign.images.map(img => {
      const count = campaign.tasks
        .filter(t => t.imageId === img.id)
        .reduce((acc, t) => acc + (taskIdToCount.get(t.id) || 0), 0)
      return [img.id, count]
    })
  )

  return { campaign, metrics: { totalImages, assignedWorkers, tasksCompleted, overallProgress }, imageResponseCounts }
}

export default async function CampaignDetailPage({ params }) {
  const data = await getCampaign(params.id)
  if (!data) return <div className="mx-auto max-w-5xl">Not found</div>
  const { campaign, metrics, imageResponseCounts } = data

  async function toggleActive() {
    'use server'
    // server action is not available in this environment; using fetch from client would be typical.
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{campaign.title}</h1>
          <p className="text-sm text-neutral-500">{campaign.question}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={campaign.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}>
            {campaign.active ? 'Active' : 'Inactive'}
          </Badge>
          <CampaignActiveToggle id={campaign.id} initialActive={campaign.active} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Images</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{metrics.totalImages}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Assigned Workers</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{metrics.assignedWorkers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tasks Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{metrics.tasksCompleted}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overall Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{metrics.overallProgress}%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Images Progress</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <THead>
              <tr>
                <TH>Image</TH>
                <TH>Ground Truth</TH>
                <TH>Responses</TH>
              </tr>
            </THead>
            <tbody>
              {campaign.images.map(img => (
                <TR key={img.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
                      <span className="truncate max-w-[420px] text-neutral-700 dark:text-neutral-300">{img.url}</span>
                    </div>
                  </TD>
                  <TD>{img.groundTruth == null ? '-' : (img.groundTruth ? 'Yes' : 'No')}</TD>
                  <TD>{imageResponseCounts[img.id] || 0}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
