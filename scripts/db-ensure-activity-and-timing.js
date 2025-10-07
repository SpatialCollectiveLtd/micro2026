import prisma from '../src/lib/prisma.js'

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    table, column
  )
  const cnt = Number((rows?.[0]?.cnt) || 0)
  return cnt > 0
}

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    table
  )
  const cnt = Number((rows?.[0]?.cnt) || 0)
  return cnt > 0
}

async function ensureActivityLogs() {
  const exists = await tableExists('activity_logs')
  if (exists) return
  await prisma.$executeRawUnsafe(
    "CREATE TABLE `activity_logs` (`id` VARCHAR(191) NOT NULL, `userId` VARCHAR(191) NOT NULL, `type` VARCHAR(191) NOT NULL, `meta` TEXT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (`id`)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  )
  await prisma.$executeRawUnsafe("CREATE INDEX `activity_logs_userId_createdAt_idx` ON `activity_logs`(`userId`, `createdAt`)")
}

async function ensureTaskTiming() {
  if (!(await columnExists('tasks','servedAt'))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `tasks` ADD COLUMN `servedAt` DATETIME(3) NULL")
  }
  if (!(await columnExists('tasks','answeredAt'))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `tasks` ADD COLUMN `answeredAt` DATETIME(3) NULL")
  }
  if (!(await columnExists('tasks','durationSeconds'))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `tasks` ADD COLUMN `durationSeconds` INT NULL")
  }
}

async function ensureDailyReportMetrics() {
  if (!(await columnExists('daily_reports','avgDurationSeconds'))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `daily_reports` ADD COLUMN `avgDurationSeconds` DOUBLE NOT NULL DEFAULT 0")
  }
  if (!(await columnExists('daily_reports','fastAnswers'))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `daily_reports` ADD COLUMN `fastAnswers` INT NOT NULL DEFAULT 0")
  }
}

async function main() {
  await ensureActivityLogs()
  await ensureTaskTiming()
  await ensureDailyReportMetrics()
  console.log('DB ensure complete for activity logs and timing columns')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
