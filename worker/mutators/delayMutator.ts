import { Train, TrainDelayEvent } from '@/types';
import { trainService } from '@/lib/services/trainService';
import { eventPublisher } from '../utils/eventPublisher';
import { logger } from '../utils/logger';
import { getRandomDelayMagnitude, shouldHappen } from '../config/probabilities';
import { MAX_DELAY_MINUTES } from '../config/constants';
import { v7 as uuidv7 } from 'uuid';
/**
* Delay Mutator
*
* Handles adding delays to trains.
*
* ANALOGY: Like a signal going yellow - train is running late
* but still moving.
*/
export class DelayMutator {
    /**
    * Apply a random delay to a train
    */
    async applyDelay(train: Train): Promise<TrainDelayEvent | null> {
        // Don't delay cancelled trains
        if (train.status === 'CANCELLED') {
            return null;
        }
        // Calculate new delay (current + random addition)
        const additionalDelay = getRandomDelayMagnitude();
        const newDelay = Math.min(
            train.delayMinutes + additionalDelay,
            MAX_DELAY_MINUTES
        );
        // If no actual change, skip
        if (newDelay === train.delayMinutes) {
            return null;
        }
        // Update expected arrival time
        const newExpectedArrival = this.addMinutesToTime(
            train.scheduledArrival,
            newDelay
        );
        // Update train in Redis
        const updated = await trainService.updateTrain(train.id, {
            delayMinutes: newDelay,
            expectedArrival: newExpectedArrival,
            // If train was ON_TIME, now it's DELAYED
            status: train.status === 'ON_TIME' ? 'DELAYED' : train.status
        });
        if (!updated) {
            logger.error(`Failed to update train ${train.id} with delay`);
            return null;
        }
        // Create event
        const event: TrainDelayEvent = {
            id: uuidv7(),
            type: 'TRAIN_DELAY',
            timestamp: Date.now(),
            trainId: train.id,
            previousDelayMinutes: train.delayMinutes,
            newDelayMinutes: newDelay,
            delayIncrease: newDelay - train.delayMinutes,
            reason: this.getDelayReason(additionalDelay)
        };
        // Publish event
        await eventPublisher.publish(event);
        logger.info(`Train ${train.number} delayed by ${additionalDelay} min`);
        return event;
    }
    /**
    * Add minutes to a time string (HH:MM)
    */
    private addMinutesToTime(time: string, minutes: number): string {
        const [hours, mins] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMins = totalMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    }
    /**
    * Get a realistic delay reason
    */
    private getDelayReason(delayMinutes: number): string {
        const reasons = [
            'Signal failure ahead',
            'Crowded platform',
            'Waiting for connecting train',
            'Technical inspection',
            'Track maintenance',
            'Weather conditions',
            'Late departure from previous station',
            'Passenger congestion',
            'Operational constraints'
        ];
        // Larger delays get more serious reasons
        if (delayMinutes > 15) {
            const seriousReasons = [
                'Track blockage',
                'Signal system failure',
                'Engine trouble',
                'Accident on track',
                'Emergency stop'
            ];
            return seriousReasons[Math.floor(Math.random() * seriousReasons.length)];
        }
        return reasons[Math.floor(Math.random() * reasons.length)];
    }
}
export const delayMutator = new DelayMutator();
