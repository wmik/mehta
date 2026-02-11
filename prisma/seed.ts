import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a demo supervisor
  const hashedPassword = await bcrypt.hash('password', 12)

  const supervisor = await prisma.supervisor.upsert({
    where: { email: 'supervisor@shamiri.org' },
    update: {},
    create: {
      email: 'supervisor@shamiri.org',
      name: 'Dr. Sarah Johnson',
      password: hashedPassword,
    },
  })

  console.log('Created supervisor:', supervisor)

  // Create demo fellows
  const fellows = [
    {
      name: 'Michael Kimani',
      email: 'michael.k@shamiri.org',
      supervisorId: supervisor.id,
    },
    {
      name: 'Grace Wanjiru',
      email: 'grace.w@shamiri.org',
      supervisorId: supervisor.id,
    },
    {
      name: 'David Otieno',
      email: 'david.o@shamiri.org',
      supervisorId: supervisor.id,
    },
  ]

  for (const fellowData of fellows) {
    const fellow = await prisma.fellow.upsert({
      where: { email: fellowData.email },
      update: {},
      create: fellowData,
    })
    console.log('Created fellow:', fellow)
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })