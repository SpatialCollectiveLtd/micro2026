// Backfill images.sequence per campaign where sequence is 0.
// Assigns deterministic order by createdAt, then id.
import prisma from '../src/lib/prisma.js'

async function main() {
  try {
    const campaigns = await prisma.$queryRawUnsafe("SELECT id FROM campaigns")
    let totalUpdated = 0
    for (const c of campaigns) {
      const campaignId = c.id
      const maxRows = await prisma.$queryRawUnsafe(
        `SELECT MAX(sequence) AS maxSeq FROM images WHERE campaignId = ?`,
        campaignId
      )
      const maxSeq = (Array.isArray(maxRows) && maxRows[0] && (maxRows[0].maxSeq ?? 0)) || 0
      const rows = await prisma.$queryRawUnsafe(
        `SELECT id FROM images WHERE campaignId = ? AND sequence = 0 ORDER BY createdAt ASC, id ASC`,
        campaignId
      )
      if (!rows || rows.length === 0) continue
      let seq = Number(maxSeq) || 0
      for (const r of rows) {
        seq += 1
        await prisma.$executeRawUnsafe(`UPDATE images SET sequence = ? WHERE id = ?`, seq, r.id)
        totalUpdated++
      }
    }
    console.log(`Backfill complete. Updated ${totalUpdated} image sequences.`)
    process.exit(0)
  } catch (e) {
    console.error('Backfill failed:', e)
    process.exit(1)
  }
}

main()
