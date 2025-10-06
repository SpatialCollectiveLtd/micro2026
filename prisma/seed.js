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
