import { Train, TrainRecoveryEvent } from '@/types';
import { trainService } from '@/lib/services/trainService';
import { eventPublisher } from '../utils/eventPublisher';
import { logger } from '../utils/logger';
import { RECOVERY_RATE_PER_HOUR } from '../config/constants';
import { v7 as uuidv7 } from 'uuid';
/**
* Recovery Mutator
*
* Handles trains making up lost time.
*
* ANALOGY: Train speeds up slightly between stations to recover delay
*/
export class RecoveryMutator {
    /**
    * Apply delay recovery to a train
    */
    async applyRecovery(train: Train): Promise<TrainRecoveryEvent | null> {
        // Can't recover if no delay or cancelled
        if (train.delayMinutes === 0 || train.status === 'CANCELLED') {
            return null;
        }
        // Calculate recovery amount (1-5 minutes, based on RECOVERY_RATE)
        // In real life, trains recover 1-2 minutes per station
        const maxRecovery = Math.min(5, train.delayMinutes);
        const recoveredMinutes = Math.floor(Math.random() * maxRecovery) + 1;
        const newDelay = train.delayMinutes - recoveredMinutes;
        // Update expected arrival time
        const newExpectedArrival = this.subtractMinutesFromTime(
            train.expectedArrival,
            recoveredMinutes
        );
        // Determine new status
        let newStatus = train.status;
        if (newDelay === 0) {
            newStatus = 'ON_TIME';
        }
        // Update train in Redis
        const updated = await trainService.updateTrain(train.id, {
            delayMinutes: newDelay,
            expectedArrival: newExpectedArrival,
            status: newStatus
        });
        if (!updated) {
            logger.error(`Failed to update train ${train.id} with recovery`);
            return null;
        }
        // Create event
        const event: TrainRecoveryEvent = {
            id: uuidv7(),
            type: 'TRAIN_RECOVERY',
            timestamp: Date.now(),
            trainId: train.id,
            previousDelayMinutes: train.delayMinutes,
            newDelayMinutes: newDelay,
            recoveredMinutes
        };
        // Publish event
        await eventPublisher.publish(event);
        if (newDelay === 0) {
            logger.info(`Train ${train.number} recovered fully and is now ON TIME`);
        } else {
            logger.info(`Train ${train.number} recovered ${recoveredMinutes} min`);
        }
        return event;
    }
    /**
    * Subtract minutes from a time string (HH:MM)
    */
    private subtractMinutesFromTime(time: string, minutes: number): string {
        const [hours, mins] = time.split(':').map(Number);
        let totalMinutes = hours * 60 + mins - minutes;
        // Handle negative times (wrap around to previous day)
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60;
        }
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    }
}
export const recoveryMutator = new RecoveryMutator();
