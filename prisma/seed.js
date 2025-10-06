/* eslint-disable no-console */
const { PrismaClient, UserRole } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create settlements
  const settlementNames = [
    'Mji wa Huruma',
    'Kayole Soweto',
    'Kariobangi',
  ]

  const settlements = {}
  for (const name of settlementNames) {
    const s = await prisma.settlement.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    settlements[name] = s
  }

  // Create admin user (no settlement)
  const adminPhone = process.env.ADMIN_PHONE || '0712345678'
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: UserRole.ADMIN, settlementId: null },
    create: {
      phone: adminPhone,
      role: UserRole.ADMIN,
      settlementId: null,
    },
  })

  // Create two sample workers, each assigned to one of the new settlements
  const worker1Phone = process.env.WORKER1_PHONE || '0700000001'
  const worker2Phone = process.env.WORKER2_PHONE || '0700000002'

  await prisma.user.upsert({
    where: { phone: worker1Phone },
    update: { role: UserRole.WORKER, settlementId: settlements['Mji wa Huruma'].id },
    create: {
      phone: worker1Phone,
      role: UserRole.WORKER,
      settlementId: settlements['Mji wa Huruma'].id,
    },
  })

  await prisma.user.upsert({
    where: { phone: worker2Phone },
    update: { role: UserRole.WORKER, settlementId: settlements['Kayole Soweto'].id },
    create: {
      phone: worker2Phone,
      role: UserRole.WORKER,
      settlementId: settlements['Kayole Soweto'].id,
    },
  })

  // Seed a few panoramic images (replace URLs with your CDN/storage later)
  const imagesPayload = [
    { url: 'https://images.unsplash.com/photo-1581094397580-d0b2f7db537a?q=80&w=2400&auto=format', question: 'Is there a public water point visible?' },
    { url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=2400&auto=format', question: 'Is there a community waste bin present?' },
    { url: 'https://images.unsplash.com/photo-1518309632010-23f5f3c5c0b6?q=80&w=2400&auto=format', question: 'Is there any street lighting installed?' },
  ]
  const images = []
  for (const img of imagesPayload) {
    const rec = await prisma.image.create({ data: img })
    images.push(rec)
  }

  // Assign a few tasks to worker1 (uncompleted)
  const worker1 = await prisma.user.findUnique({ where: { phone: worker1Phone } })
  if (worker1 && worker1.settlementId) {
    for (const img of images) {
      await prisma.task.create({
        data: {
          userId: worker1.id,
          settlementId: worker1.settlementId,
          imageId: img.id,
        },
      })
    }
  }

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
