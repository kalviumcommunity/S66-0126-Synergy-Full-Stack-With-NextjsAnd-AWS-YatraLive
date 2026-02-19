import { prisma } from '@/lib/prisma/client';

export class EventLogger {
  async log(event: {
    type: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    source: string;
    message: string;
    details?: unknown;
  }): Promise<void> {
    try {
      await prisma.systemEvent.create({
        data: {
          type: event.type,
          level: event.level,
          source: event.source,
          message: event.message,
          details: event.details as object | undefined,
        },
      });
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }

  async getRecentEvents(limit = 100) {
    return prisma.systemEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getErrorsSince(date: Date) {
    return prisma.systemEvent.findMany({
      where: {
        level: 'ERROR',
        createdAt: { gte: date },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const eventLogger = new EventLogger();
