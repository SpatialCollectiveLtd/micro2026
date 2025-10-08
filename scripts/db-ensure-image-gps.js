import prisma from '../src/lib/prisma.js'

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    table, column
  )
  const cnt = Number((rows?.[0]?.cnt) || 0)
  return cnt > 0
}

async function main() {
  const needLat = !(await columnExists('images','latitude'))
  const needLon = !(await columnExists('images','longitude'))

  if (!needLat && !needLon) {
    console.log('images.latitude/longitude already exist')
  } else {
    if (needLat) {
      console.log('Adding images.latitude (DOUBLE NULL)')
      await prisma.$executeRawUnsafe("ALTER TABLE `images` ADD COLUMN `latitude` DOUBLE NULL")
    }
    if (needLon) {
      console.log('Adding images.longitude (DOUBLE NULL)')
      await prisma.$executeRawUnsafe("ALTER TABLE `images` ADD COLUMN `longitude` DOUBLE NULL")
    }
    console.log('GPS columns ensured')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
