import prisma from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import CampaignActiveToggle from '@/components/CampaignActiveToggle'
import CampaignActions from '@/components/CampaignActions'
import { Table, THead, TH, TR, TD } from '@/components/ui/table'
import Button from '@/components/ui/button'
import Link from 'next/link'

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
          {campaign.archived && <div className="mt-1 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Archived</div>}
        </div>
        <div className="flex items-center gap-2">
          <CampaignActiveToggle id={campaign.id} initialActive={campaign.active} />
          <Link className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700" href={`/admin/campaigns/${campaign.id}/edit`}>Edit</Link>
          <CampaignActions id={campaign.id} archived={campaign.archived} />
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
                <TH>GPS</TH>
                <TH>Responses</TH>
              </tr>
            </THead>
            <tbody>
              {campaign.images.map(img => (
                <TR key={img.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
                      <span className="truncate max-w-[420px] text-neutral-700 dark:text-neutral-300">{img.url}</span>
                    </div>
                  </TD>
                  <TD>{img.groundTruth == null ? '—' : (img.groundTruth ? 'Yes' : 'No')}</TD>
                  <TD>
                    {typeof img.latitude === 'number' && typeof img.longitude === 'number' ? (
                      <a
                        className="text-blue-600 hover:underline dark:text-blue-400"
                        href={`https://maps.google.com/?q=${img.latitude},${img.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {img.latitude.toFixed(5)}, {img.longitude.toFixed(5)}
                      </a>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </TD>
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
