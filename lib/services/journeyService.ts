import { prisma } from '@/lib/prisma/client';
import type { Train, TrainEvent } from '@/types';

type DelayEventType = TrainEvent & {
  type: 'TRAIN_DELAY' | 'TRAIN_RECOVERY';
  newDelayMinutes: number;
};

export class JourneyService {
  async recordCompletedJourney(train: Train): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await prisma.journeyHistory.findFirst({
        where: {
          trainId: train.id,
          scheduledDate: today,
        },
      });

      const baseData = {
        actualTime: train.expectedArrival,
        delayMinutes: train.delayMinutes,
        status: train.status,
        finalStationIndex: train.currentStationIndex,
        completedStations: train.route.slice(0, train.currentStationIndex + 1),
      };

      if (existing) {
        await prisma.journeyHistory.update({
          where: { id: existing.id },
          data: baseData,
        });
      } else {
        await prisma.journeyHistory.create({
          data: {
            trainId: train.id,
            trainNumber: train.number,
            trainName: train.name,
            source: train.source,
            destination: train.destination,
            route: train.route,
            scheduledDate: today,
            scheduledTime: train.scheduledArrival,
            ...baseData,
          },
        });
      }
    } catch (error) {
      console.error('Failed to record completed journey:', error);
    }
  }

  async recordDelayEvent(event: DelayEventType): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const journey = await prisma.journeyHistory.findFirst({
        where: {
          trainId: event.trainId,
          scheduledDate: today,
        },
      });

      if (!journey) {
        return;
      }

      await prisma.journeyHistory.update({
        where: { id: journey.id },
        data: {
          delayMinutes: event.newDelayMinutes,
          status: event.newDelayMinutes > 0 ? 'DELAYED' : 'ON_TIME',
        },
      });
    } catch (error) {
      console.error('Failed to record delay event:', error);
    }
  }

  async getTrainHistory(trainId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.journeyHistory.findMany({
      where: {
        trainId,
        scheduledDate: {
          gte: startDate,
        },
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    });
  }

  async getAverageDelay(trainId: string, days = 30): Promise<number> {
    const history = await this.getTrainHistory(trainId, days);
    if (history.length === 0) {
      return 0;
    }

    const totalDelay = history.reduce(
      (sum: number, item: { delayMinutes: number }) => sum + item.delayMinutes,
      0
    );
    return totalDelay / history.length;
  }

  async getOnTimePerformance(trainId: string, days = 30): Promise<number> {
    const history = await this.getTrainHistory(trainId, days);
    if (history.length === 0) {
      return 100;
    }

    const onTimeCount = history.filter(
      (item: { delayMinutes: number }) => item.delayMinutes === 0
    ).length;
    return (onTimeCount / history.length) * 100;
  }

  async updateDelayPatterns(): Promise<void> {
    return Promise.resolve();
  }
}

export const journeyService = new JourneyService();
