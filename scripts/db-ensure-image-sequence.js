// Idempotently add `sequence` INT column to images table if missing.
import prisma from '../src/lib/prisma.js'

async function main() {
  try {
    const rows = await prisma.$queryRawUnsafe(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'images' AND COLUMN_NAME = 'sequence'"
    )
    const exists = Array.isArray(rows) && rows.length > 0
    if (exists) {
      console.log('images.sequence already exists')
      process.exit(0)
    }
    await prisma.$executeRawUnsafe("ALTER TABLE `images` ADD COLUMN `sequence` INT NOT NULL DEFAULT 0")
    console.log('images.sequence added')
    process.exit(0)
  } catch (e) {
    console.error('Failed to ensure images.sequence:', e)
    process.exit(1)
  }
}

main()
