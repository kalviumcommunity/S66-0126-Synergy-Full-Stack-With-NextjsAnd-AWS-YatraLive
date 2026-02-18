import { Train, TrainPlatformChangeEvent } from '@/types';
import { trainService } from '@/lib/services/trainService';
import { eventPublisher } from '../utils/eventPublisher';
import { logger } from '../utils/logger';
import { v7 as uuidv7 } from 'uuid';
/**
* Platform Mutator
*
* Handles platform changes.
*
* ANALOGY: Station master reassigns platform due to congestion
*/
export class PlatformMutator {
    /**
    * Change a train's platform
    */
    async changePlatform(train: Train): Promise<TrainPlatformChangeEvent | null> {
        // Can't change platform for cancelled trains
        if (train.status === 'CANCELLED') {
            return null;
        }
        // Generate new platform (different from current)
        let newPlatform: number;
        do {
            // Assume platforms 1-8 at most stations
            newPlatform = Math.floor(Math.random() * 8) + 1;
        } while (newPlatform === train.platform);
        // Update train in Redis
        const updated = await trainService.updateTrain(train.id, {
            platform: newPlatform
        });
        if (!updated) {
            logger.error(`Failed to update train ${train.id} platform`);
            return null;
        }
        // Create event
        const event: TrainPlatformChangeEvent = {
            id: uuidv7(),
            type: 'PLATFORM_CHANGE',
            timestamp: Date.now(),
            trainId: train.id,
            previousPlatform: train.platform,
            newPlatform
        };
        // Publish event
        await eventPublisher.publish(event);
        logger.info(`Train ${train.number} platform changed: ${train.platform} -> ${newPlatform}`);
        return event;
    }
}
export const platformMutator = new PlatformMutator();
