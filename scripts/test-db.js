// Simple Prisma connectivity check and quick counts
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$queryRaw`SELECT 1`
    const [users, settlements] = await Promise.all([
      prisma.user.count(),
      prisma.settlement.count(),
    ])
    console.log(JSON.stringify({ ok: true, users, settlements }))
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: err?.message || String(err) }))
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
