import prisma from '../src/lib/prisma.js'

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    table
  )
  return Number(rows?.[0]?.cnt || 0) > 0
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    table,
    column
  )
  return Number(rows?.[0]?.cnt || 0) > 0
}

async function indexExists(table, indexName) {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) as cnt FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?',
    table,
    indexName
  )
  return Number(rows?.[0]?.cnt || 0) > 0
}

async function ensureSettingsTable() {
  if (await tableExists('settings')) {
    console.log('settings table already exists')
    return
  }
  console.log('Creating settings table...')
  await prisma.$executeRawUnsafe(
    "CREATE TABLE `settings` (\n" +
      "`id` VARCHAR(191) NOT NULL,\n" +
      "`key` VARCHAR(191) NOT NULL,\n" +
      "`value` TEXT NOT NULL,\n" +
      "`createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),\n" +
      "`updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),\n" +
      "PRIMARY KEY (`id`)\n" +
    ") DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  )
  // Unique key on `key`
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX `settings_key_key` ON `settings`(`key`)')
  console.log('settings table created')
}

async function ensureUserSessionId() {
  const table = 'users'
  if (!(await columnExists(table, 'sessionId'))) {
    console.log('Adding users.sessionId (VARCHAR(191) NULL)')
    await prisma.$executeRawUnsafe('ALTER TABLE `users` ADD COLUMN `sessionId` VARCHAR(191) NULL')
  } else {
    console.log('users.sessionId already exists')
  }
  // Ensure unique index; allow multiple NULLs by MySQL semantics
  if (!(await indexExists(table, 'users_sessionId_key')) && !(await indexExists(table, 'User_sessionId_key'))) {
    console.log('Creating unique index on users.sessionId')
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX `users_sessionId_key` ON `users`(`sessionId`)')
  } else {
    console.log('Unique index on users.sessionId already exists')
  }
}

async function main() {
  await ensureSettingsTable()
  await ensureUserSessionId()
  console.log('DB ensure complete for settings table and users.sessionId')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
