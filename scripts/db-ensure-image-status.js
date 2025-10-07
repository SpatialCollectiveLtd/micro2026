import prisma from '../src/lib/prisma.js'

async function main() {
  const [{ cnt }] = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'images' AND COLUMN_NAME = 'status'"
  )
  if (Number(cnt) > 0) {
    console.log('images.status column already exists')
    return
  }
  console.log('images.status column missing; applying ALTER TABLE...')
  await prisma.$executeRawUnsafe("ALTER TABLE `images` ADD COLUMN `status` ENUM('PENDING','COMPLETE','FLAGGED') NOT NULL DEFAULT 'PENDING'")
  console.log('images.status column added successfully')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
