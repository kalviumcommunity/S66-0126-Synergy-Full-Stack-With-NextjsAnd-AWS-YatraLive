import { redis } from '../redis/client';
import {
  Train,
  TrainInput,
  TrainUpdate,
  TrainStatus,
  isValidTrain,
  parseTrainFromRedis,
} from '../../types';
import {
  getTrainKey,
  getTrainsByStatusKey,
  TRAIN_HASH_FIELDS,
} from '../../types/redis/keys';
import { v7 as uuidv7 } from 'uuid';

/**
 * Train Service
 *
 * Provides a clean, type-safe interface for train operations in Redis.
 */
export class TrainService {
  async createTrain(input: TrainInput): Promise<Train> {
    const id = `train_${uuidv7()}`;
    const now = Date.now();
    const train: Train = {
      id,
      ...input,
      status: input.status || 'ON_TIME',
      delayMinutes: input.delayMinutes || 0,
      lastUpdated: now,
      createdAt: now,
    };

    const pipeline = redis.pipeline();
    pipeline.hset(getTrainKey(id), {
      [TRAIN_HASH_FIELDS.ID]: train.id,
      [TRAIN_HASH_FIELDS.NUMBER]: train.number,
      [TRAIN_HASH_FIELDS.NAME]: train.name,
      [TRAIN_HASH_FIELDS.SOURCE]: train.source,
      [TRAIN_HASH_FIELDS.DESTINATION]: train.destination,
      [TRAIN_HASH_FIELDS.STATUS]: train.status,
      [TRAIN_HASH_FIELDS.DELAY_MINUTES]: train.delayMinutes.toString(),
      [TRAIN_HASH_FIELDS.PLATFORM]: train.platform.toString(),
      [TRAIN_HASH_FIELDS.SCHEDULED_ARRIVAL]: train.scheduledArrival,
      [TRAIN_HASH_FIELDS.EXPECTED_ARRIVAL]: train.expectedArrival,
      [TRAIN_HASH_FIELDS.ROUTE]: JSON.stringify(train.route),
      [TRAIN_HASH_FIELDS.CURRENT_STATION_INDEX]: train.currentStationIndex.toString(),
      [TRAIN_HASH_FIELDS.LAST_UPDATED]: train.lastUpdated.toString(),
      [TRAIN_HASH_FIELDS.CREATED_AT]: train.createdAt.toString(),
    });
    pipeline.sadd('trains', id);
    pipeline.sadd(getTrainsByStatusKey(train.status), id);
    await pipeline.exec();
    return train;
  }

  async getTrain(id: string): Promise<Train | null> {
    const data = await redis.hgetall(getTrainKey(id));
    if (Object.keys(data).length === 0) return null;
    const train = parseTrainFromRedis(data);
    if (!train) {
      console.error(`[TrainService] Invalid train data for ID:${id}`);
      return null;
    }
    return train;
  }

  async getAllTrains(options?: {
    status?: TrainStatus;
    station?: string;
    limit?: number;
    offset?: number;
  }): Promise<Train[]> {
    let trainIds: string[];
    if (options?.status) {
      trainIds = await redis.smembers(getTrainsByStatusKey(options.status));
    } else if (options?.station) {
      // TODO: implement station-based sets; fallback to all
      trainIds = await redis.smembers('trains');
    } else {
      trainIds = await redis.smembers('trains');
    }

    if (options?.offset || options?.limit) {
      const offset = options?.offset || 0;
      const limit = options?.limit || trainIds.length;
      trainIds = trainIds.slice(offset, offset + limit);
    }

    const trainPromises = trainIds.map((tid) => this.getTrain(tid));
    const trains = await Promise.all(trainPromises);
    return trains.filter((t): t is Train => t != null);
  }

  async updateTrain(id: string, updates: TrainUpdate): Promise<Train | null> {
    const existing = await this.getTrain(id);
    if (!existing) return null;

    const updated: Train = {
      ...existing,
      ...updates,
      lastUpdated: Date.now(),
    };

    if (updates.status && updates.status !== existing.status) {
      const pipeline = redis.pipeline();
      pipeline.srem(getTrainsByStatusKey(existing.status), id);
      pipeline.sadd(getTrainsByStatusKey(updates.status), id);
      await pipeline.exec();
    }

    const updateData: Record<string, string> = {};
    if (updates.status) updateData[TRAIN_HASH_FIELDS.STATUS] = updates.status;
    if (updates.delayMinutes !== undefined)
      updateData[TRAIN_HASH_FIELDS.DELAY_MINUTES] = updates.delayMinutes.toString();
    if (updates.platform !== undefined) updateData[TRAIN_HASH_FIELDS.PLATFORM] = updates.platform.toString();
    if (updates.expectedArrival) updateData[TRAIN_HASH_FIELDS.EXPECTED_ARRIVAL] = updates.expectedArrival;
    if (updates.currentStationIndex !== undefined)
      updateData[TRAIN_HASH_FIELDS.CURRENT_STATION_INDEX] = updates.currentStationIndex.toString();
    updateData[TRAIN_HASH_FIELDS.LAST_UPDATED] = updated.lastUpdated.toString();

    if (Object.keys(updateData).length > 0) {
      await redis.hset(getTrainKey(id), updateData);
    }

    return updated;
  }

  async deleteTrain(id: string): Promise<boolean> {
    const existing = await this.getTrain(id);
    if (!existing) return false;
    const pipeline = redis.pipeline();
    pipeline.srem('trains', id);
    pipeline.srem(getTrainsByStatusKey(existing.status), id);
    pipeline.del(getTrainKey(id));
    await pipeline.exec();
    return true;
  }

  async getTrainsByStatus(status: TrainStatus): Promise<Train[]> {
    const trainIds = await redis.smembers(getTrainsByStatusKey(status));
    const trains = await Promise.all(trainIds.map((id) => this.getTrain(id)));
    return trains.filter((t): t is Train => t != null);
  }

  async countTrainsByStatus(): Promise<Record<TrainStatus, number>> {
    const [onTime, delayed, cancelled] = await Promise.all([
      redis.scard(getTrainsByStatusKey('ON_TIME')),
      redis.scard(getTrainsByStatusKey('DELAYED')),
      redis.scard(getTrainsByStatusKey('CANCELLED')),
    ]);
    return {
      ON_TIME: onTime,
      DELAYED: delayed,
      CANCELLED: cancelled,
    } as Record<TrainStatus, number>;
  }

  async batchUpdate(updates: Array<{ id: string; updates: TrainUpdate }>): Promise<number> {
    let successCount = 0;
    const pipeline = redis.pipeline();
    for (const { id, updates: trainUpdates } of updates) {
      const existing = await this.getTrain(id);
      if (!existing) continue;
      const updateData: Record<string, string> = {};
      if (trainUpdates.status) updateData[TRAIN_HASH_FIELDS.STATUS] = trainUpdates.status;
      if (trainUpdates.delayMinutes !== undefined)
        updateData[TRAIN_HASH_FIELDS.DELAY_MINUTES] = trainUpdates.delayMinutes.toString();
      if (trainUpdates.platform !== undefined)
        updateData[TRAIN_HASH_FIELDS.PLATFORM] = trainUpdates.platform.toString();
      updateData[TRAIN_HASH_FIELDS.LAST_UPDATED] = Date.now().toString();
      if (Object.keys(updateData).length > 0) {
        pipeline.hset(getTrainKey(id), updateData);
        successCount++;
      }
    }
    if (successCount > 0) await pipeline.exec();
    return successCount;
  }
}

export const trainService = new TrainService();
