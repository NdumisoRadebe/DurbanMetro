import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Super Admin
  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ethekwini.gov.za' },
    update: {},
    create: {
      email: 'admin@ethekwini.gov.za',
      name: 'System Administrator',
      role: 'SUPER_ADMIN',
      password: hashedPassword,
      isActive: true,
    },
  })
  console.log('Created admin:', admin.email)

  // Create HR Admin
  const hrAdmin = await prisma.user.upsert({
    where: { email: 'hr@ethekwini.gov.za' },
    update: {},
    create: {
      email: 'hr@ethekwini.gov.za',
      name: 'HR Administrator',
      role: 'HR_ADMIN',
      password: hashedPassword,
      isActive: true,
    },
  })
  console.log('Created HR admin:', hrAdmin.email)

  // Create Leave Type Configurations
  const leaveTypes = [
    { code: 'ANL', name: 'Annual Leave', color: '#3B82F6', isPaid: true },
    { code: 'SICK', name: 'Sick Leave', color: '#EF4444', isPaid: true },
    { code: 'AOL', name: 'Absence Without Leave', color: '#1F2937', isPaid: false },
    { code: 'FR', name: 'Family Responsibility', color: '#10B981', isPaid: true },
    { code: 'TRN', name: 'Training Leave', color: '#F59E0B', isPaid: true },
    { code: 'COMP', name: 'Compassionate Leave', color: '#8B5CF6', isPaid: true },
    { code: 'MAT', name: 'Maternity/Paternity', color: '#EC4899', isPaid: true },
    { code: 'SUS', name: 'Suspension', color: '#6B7280', isPaid: false },
  ]

  for (const lt of leaveTypes) {
    await prisma.leaveTypeConfig.upsert({
      where: { code: lt.code },
      update: lt,
      create: lt,
    })
  }
  console.log('Created leave type configurations')

  // Create sample officers
  const officers = [
    { aoNumber: 'AO001234', pcNumber: 'PC567890', firstName: 'John', lastName: 'Dlamini', rank: 'Constable', station: 'Durban Central', contactNumber: '0821234567', email: 'john.d@example.com', dateOfJoining: new Date('2020-03-15') },
    { aoNumber: 'AO001235', pcNumber: 'PC567891', firstName: 'Thandi', lastName: 'Nkosi', rank: 'Sergeant', station: 'Mayville', contactNumber: '0831234568', email: 'thandi.n@example.com', dateOfJoining: new Date('2018-07-22') },
  ]

  for (const o of officers) {
    await prisma.officer.upsert({
      where: { aoNumber: o.aoNumber },
      update: {},
      create: o,
    })
  }
  console.log('Created sample officers')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
