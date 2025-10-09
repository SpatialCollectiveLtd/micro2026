import prisma from '../src/lib/prisma.js'

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    table
  )
  return Number(rows?.[0]?.cnt || 0) > 0
}

async function main() {
  const exists = await tableExists('change_requests')
  if (exists) {
    console.log('change_requests already exists')
  } else {
    console.log('Creating change_requests table...')
    await prisma.$executeRawUnsafe(
      "CREATE TABLE `change_requests` (\n" +
        "`id` VARCHAR(191) NOT NULL,\n" +
        "`userId` VARCHAR(191) NOT NULL,\n" +
        "`message` TEXT NOT NULL,\n" +
        "`status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',\n" +
        "`createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),\n" +
        "`updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),\n" +
        "PRIMARY KEY (`id`)\n" +
      ") DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    )
    await prisma.$executeRawUnsafe('CREATE INDEX `change_requests_userId_createdAt_idx` ON `change_requests`(`userId`, `createdAt`)')
    console.log('change_requests table created')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
