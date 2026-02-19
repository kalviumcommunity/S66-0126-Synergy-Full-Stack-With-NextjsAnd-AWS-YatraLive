import { prisma } from '@/lib/prisma/client';

export class AuditService {
  async logAdminAction(params: {
    adminId?: string;
    adminEmail?: string;
    action: string;
    entityType: string;
    entityId?: string;
    beforeState?: unknown;
    afterState?: unknown;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          adminId: params.adminId,
          adminEmail: params.adminEmail,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          beforeState: params.beforeState as object | undefined,
          afterState: params.afterState as object | undefined,
          metadata: {
            ...(params.metadata ?? {}),
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async getAuditLogs(options: {
    limit?: number;
    adminId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { limit = 100, adminId, entityType, entityId, action, startDate, endDate } = options;

    return prisma.auditLog.findMany({
      where: {
        adminId,
        entityType,
        entityId,
        action,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}

export const auditService = new AuditService();
