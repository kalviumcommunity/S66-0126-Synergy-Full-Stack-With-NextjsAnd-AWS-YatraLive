import { redis } from '@/lib/redis/client';
import { TrainEvent } from '@/types';
import { getTrainEventsKey } from '@/types/redis/keys';
import { logger } from './logger';
import { EVENT_RETENTION_HOURS } from '../config/constants';

/**
 * Event Publisher
 * 
 * Now enhanced to also publish to SSE clients via Redis Pub/Sub
 */
export class EventPublisher {
  
  /**
   * Publish an event to all channels
   */
  async publish(event: TrainEvent): Promise<void> {
    try {
      const eventJson = JSON.stringify(event);
      
      // Use pipeline for atomic operations
      const pipeline = redis.pipeline();
      
      // 1. Store in train-specific event list
      pipeline.lpush(getTrainEventsKey(event.trainId), eventJson);
      pipeline.ltrim(getTrainEventsKey(event.trainId), 0, 99);
      
      // 2. Store in global recent events sorted set
      pipeline.zadd('events:recent', event.timestamp, `${event.trainId}:${event.id}`);
      
      // 3. PUBLISH to Redis Pub/Sub for SSE clients
      // This is the KEY addition - all SSE endpoints receive this
      pipeline.publish('train-updates', eventJson);
      
      // 4. Also publish to status-specific channels for filtering
      if ('newStatus' in event) {
        // Status change events
        pipeline.publish(`status:${event.newStatus}`, eventJson);
      } else if ('newPlatform' in event) {
        // Platform change events
        pipeline.publish('platform-changes', eventJson);
      } else if ('newDelayMinutes' in event) {
        // Delay events
        pipeline.publish('delays', eventJson);
      }
      
      // 5. Set expiry on old events
      pipeline.expire(getTrainEventsKey(event.trainId), EVENT_RETENTION_HOURS * 3600);
      
      await pipeline.exec();
      
      logger.debug(`Event published: ${event.type} for train ${event.trainId}`);
      
    } catch (error) {
      logger.error('Failed to publish event:', error);
    }
  }
  
  /**
   * Publish batch update (multiple events at once)
   * More efficient for worker cycles
   */
  async publishBatch(events: TrainEvent[]): Promise<void> {
    if (events.length === 0) return;
    
    try {
      const pipeline = redis.pipeline();
      
      for (const event of events) {
        const eventJson = JSON.stringify(event);
        
        // Store in train-specific list
        pipeline.lpush(getTrainEventsKey(event.trainId), eventJson);
        pipeline.ltrim(getTrainEventsKey(event.trainId), 0, 99);
        
        // Add to global recent
        pipeline.zadd('events:recent', event.timestamp, `${event.trainId}:${event.id}`);
        
        // Publish to main channel
        pipeline.publish('train-updates', eventJson);
      }
      
      await pipeline.exec();
      
      logger.info(`Batch published: ${events.length} events`);
      
    } catch (error) {
      logger.error('Failed to publish batch:', error);
    }
  }

  /**
   * Get recent events for a train
   */
  async getTrainEvents(trainId: string, limit: number = 10): Promise<TrainEvent[]> {
    try {
      const events = await redis.lrange(getTrainEventsKey(trainId), 0, limit - 1);
      return events.map(e => JSON.parse(e) as TrainEvent);
    } catch (error) {
      logger.error(`Failed to get events for train ${trainId}:`, error);
      return [];
    }
  }
  
  // ... rest of existing methods
}

export const eventPublisher = new EventPublisher();



// import { redis } from '@/lib/redis/client';
// import { TrainEvent } from '@/types';
// import { getTrainEventsKey } from '@/types/redis/keys';
// import { logger } from './logger';
// import { EVENT_RETENTION_HOURS } from '../config/constants';
// /**
// * Event Publisher
// *
// * Publishes events to Redis for:
// * 1. Real-time SSE stream
// * 2. Event history storage
// * 3. Pub/Sub for inter-process communication
// *
// * ANALOGY: Railway announcement system - broadcasts changes
// * to all displays and control rooms
// */
// export class EventPublisher {
//     /**
//     * Publish an event to all channels
//     */
//     async publish(event: TrainEvent): Promise<void> {
//         try {
//             const eventJson = JSON.stringify(event);
//             // Use pipeline for atomic operations
//             const pipeline = redis.pipeline();
//             // 1. Store in train-specific event list
//             // Keep last 100 events per train
//             pipeline.lpush(getTrainEventsKey(event.trainId), eventJson);
//             pipeline.ltrim(getTrainEventsKey(event.trainId), 0, 99);
//             // 2. Store in global recent events sorted set
//             // Score is timestamp for time-based queries
//             pipeline.zadd('events:recent', event.timestamp, `${event.trainId}:${event.id}`);
//             // 3. Publish to Redis Pub/Sub for real-time updates
//             pipeline.publish('train-updates', eventJson);
//             // 4. Set expiry on old events (cleanup)
//             pipeline.expire(getTrainEventsKey(event.trainId), EVENT_RETENTION_HOURS * 3600);
//             await pipeline.exec();
//             logger.debug(`Event published:${event.type} for train ${event.trainId}`);
//         } catch (error) {
//             logger.error('Failed to publish event:', error);
//         }
//     }
//     /**
//     * Get recent events for a train
//     */
//     async getTrainEvents(trainId: string, limit: number = 10): Promise<TrainEvent[]> {
//         try {
//             const events = await redis.lrange(getTrainEventsKey(trainId), 0, limit - 1);
//             return events.map(e => JSON.parse(e));
//         } catch (error) {
//             logger.error(`Failed to get events for train ${trainId}:`, error);
//             return [];
//         }
//     }
//     /**
//     * Get global recent events
//     */
//     async getRecentEvents(limit: number = 50): Promise<TrainEvent[]> {
//         try {
//             // Get event IDs from sorted set
//             const eventIds = await redis.zrevrange('events:recent', 0, limit - 1);
//             // Fetch actual events (this is simplified - in production you'd store event data)
//             const events: TrainEvent[] = [];
//             for (const eventId of eventIds) {
//                 const [trainId] = eventId.split(':');
//                 const trainEvents = await this.getTrainEvents(trainId, 1);
//                 if (trainEvents.length > 0) {
//                     events.push(trainEvents[0]);
//                 }
//             }
//             return events;
//         } catch (error) {
//             logger.error('Failed to get recent events:', error);
//             return [];
//         }
//     }
// }
// export const eventPublisher = new EventPublisher();
