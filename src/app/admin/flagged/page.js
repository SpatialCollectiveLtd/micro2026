import prisma from '@/lib/prisma'
import { Table, THead, TH, TR, TD } from '@/components/ui/table'
import Button from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getFlagged() {
  const images = await prisma.image.findMany({ where: { status: 'FLAGGED' }, include: { campaign: true } })
  return images
}

export default async function FlaggedImagesPage() {
  const images = await getFlagged()
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Flagged Images</h1>
        <Link href="/api/admin/reports/flagged?format=csv">
          <Button>Download CSV</Button>
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <Table>
          <THead>
            <tr>
              <TH>Image</TH>
              <TH>Campaign</TH>
              <TH>Question</TH>
              <TH>Status</TH>
            </tr>
          </THead>
          <tbody>
            {images.map(img => (
              <TR key={img.id}>
                <TD>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-10 w-10 rounded object-cover" />
                </TD>
                <TD>{img.campaign?.title || '-'}</TD>
                <TD className="truncate max-w-[420px]">{img.question}</TD>
                <TD>{img.status}</TD>
              </TR>
            ))}
            {images.length === 0 && (
              <TR>
                <TD colSpan={4} className="text-center text-neutral-500">No flagged images</TD>
              </TR>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
