import { prisma } from './prisma'

export async function createAuditLog(
  userId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityType: string,
  entityId: string,
  oldValues?: object,
  newValues?: object,
  ipAddress?: string
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
      newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
      ipAddress,
    },
  })
}
