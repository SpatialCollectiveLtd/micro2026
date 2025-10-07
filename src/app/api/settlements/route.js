import prisma from '@/lib/prisma'

export async function GET() {
  const settlements = await prisma.settlement.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return Response.json({ ok: true, settlements })
}
