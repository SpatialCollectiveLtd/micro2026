import prisma from '@/lib/prisma'
import Label from '@/components/ui/label'
import Input from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'
import Checkbox from '@/components/ui/checkbox'
import Button from '@/components/ui/button'
import FileUpload from '@/components/ui/file-upload'
import Link from 'next/link'

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
          <Label>Title</Label>
          <Input name="title" required />
        </div>
        <div>
          <Label>Question</Label>
          <Textarea name="question" required />
        </div>
        <div>
          <Label>Image URLs CSV</Label>
          <FileUpload />
        </div>
        <div>
          <Label className="mb-2">Target Settlements</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {settlements.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <Checkbox name="settlements" value={s.id} />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/campaigns">Cancel</Link>
          </Button>
          <Button type="submit">Create Campaign</Button>
        </div>
      </form>
    </div>
  )
}
