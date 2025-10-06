import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Simple connectivity check
    await prisma.$queryRaw`SELECT 1`;

    // Optional: return counts for quick smoke test
    const [users, settlements] = await Promise.all([
      prisma.user.count(),
      prisma.settlement.count(),
    ])

    return Response.json({ ok: true, users, settlements })
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
