import prisma from '../src/lib/prisma.js'

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    table,
    column
  )
  return rows.length > 0
}

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    table
  )
  return rows.length > 0
}

async function indexExists(table, indexName) {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?",
    table,
    indexName
  )
  return rows.length > 0
}

async function ensureSessionId() {
  if (!(await columnExists('users', 'sessionId'))) {
    console.log('Adding users.sessionId column...')
    await prisma.$executeRawUnsafe("ALTER TABLE `users` ADD COLUMN `sessionId` VARCHAR(191) NULL")
  }
  if (!(await indexExists('users', 'users_sessionId_key'))) {
    console.log('Adding unique index on users.sessionId...')
    try {
      await prisma.$executeRawUnsafe("CREATE UNIQUE INDEX `users_sessionId_key` ON `users`(`sessionId`)")
    } catch (e) {
      console.warn('Could not create users.sessionId unique index:', e.message)
    }
  }
}

async function ensureSettings() {
  if (!(await tableExists('settings'))) {
    console.log('Creating settings table...')
    await prisma.$executeRawUnsafe(`CREATE TABLE \`settings\` (
      \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
      \`key\` VARCHAR(191) NOT NULL UNIQUE,
      \`value\` TEXT NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  }
}

async function ensureChangeRequests() {
  if (!(await tableExists('change_requests'))) {
    console.log('Creating change_requests table...')
    await prisma.$executeRawUnsafe(`CREATE TABLE \`change_requests\` (
      \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
      \`userId\` VARCHAR(191) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX \`change_requests_userId_createdAt_idx\` (\`userId\`, \`createdAt\`),
      CONSTRAINT \`change_requests_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  }
}

async function detectDuplicateTasks() {
  const dupes = await prisma.$queryRawUnsafe(`SELECT userId, imageId, COUNT(*) as cnt FROM tasks GROUP BY userId, imageId HAVING cnt > 1 LIMIT 50`)
  if (dupes.length) {
    console.warn('Duplicate task (userId,imageId) pairs detected. Skipping unique index creation. Sample:', dupes)
    return true
  }
  return false
}

async function ensureTaskUserImageUnique() {
  const indexName = 'user_image_unique'
  if (await indexExists('tasks', indexName)) return
  const hasDupes = await detectDuplicateTasks()
  if (hasDupes) return
  console.log('Adding unique composite index tasks(userId,imageId)...')
  try {
    await prisma.$executeRawUnsafe("CREATE UNIQUE INDEX `user_image_unique` ON `tasks`(`userId`,`imageId`)")
  } catch (e) {
    console.warn('Could not create tasks(userId,imageId) unique index:', e.message)
  }
}

async function main() {
  await ensureSessionId()
  await ensureSettings()
  await ensureChangeRequests()
  await ensureTaskUserImageUnique()
  console.log('Ensure session/settings/change_requests completed.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
