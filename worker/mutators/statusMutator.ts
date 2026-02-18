import { Train, TrainStatusChangeEvent } from '@/types';
import { trainService } from '@/lib/services/trainService';
import { eventPublisher } from '../utils/eventPublisher';
import { logger } from '../utils/logger';
import { v7 as uuidv7 } from 'uuid';
/**
* Status Mutator
*
* Handles major status changes (cancellations, resumptions)
*
* ANALOGY: Train controller making big decisions
*/
export class StatusMutator {
    /**
    * Cancel a train
    */
    async cancelTrain(train: Train): Promise<TrainStatusChangeEvent | null> {
        // Already cancelled
        if (train.status === 'CANCELLED') {
            return null;
        }
        // Update train in Redis
        const updated = await trainService.updateTrain(train.id, {
            status: 'CANCELLED',
            delayMinutes: 0 // Cancelled trains don't have delays
        });
        if (!updated) {
            logger.error(`Failed to cancel train ${train.id}`);
            return null;
        }
        // Create event
        const event: TrainStatusChangeEvent = {
            id: uuidv7(),
            type: 'STATUS_CHANGE',
            timestamp: Date.now(),
            trainId: train.id,
            previousStatus: train.status,
            newStatus: 'CANCELLED'
        };
        // Publish event
        await eventPublisher.publish(event);
        logger.warn(`Train ${train.number} CANCELLED`);
        return event;
    }
    /**
    * Resume a cancelled train
    */
    async resumeTrain(train: Train): Promise<TrainStatusChangeEvent | null> {
        // Only cancelled trains can resume
        if (train.status !== 'CANCELLED') {
            return null;
        }
        // Determine new status (usually ON_TIME, sometimes DELAYED)
        const newStatus: 'ON_TIME' | 'DELAYED' =
            Math.random() > 0.7 ? 'DELAYED' : 'ON_TIME';
        const delayMinutes = newStatus === 'DELAYED' ? Math.floor(Math.random() * 15) + 5 : 0;
        // Update expected arrival if delayed
        let expectedArrival = train.scheduledArrival;
        if (delayMinutes > 0) {
            expectedArrival = this.addMinutesToTime(train.scheduledArrival, delayMinutes);
        }
        // Update train in Redis
        const updated = await trainService.updateTrain(train.id, {
            status: newStatus,
            delayMinutes,
            expectedArrival
        });
        if (!updated) {
            logger.error(`Failed to resume train ${train.id}`);
            return null;
        }
        // Create event
        const event: TrainStatusChangeEvent = {
            id: uuidv7(),
            type: 'STATUS_CHANGE',
            timestamp: Date.now(),
            trainId: train.id,
            previousStatus: 'CANCELLED',
            newStatus
        };
        // Publish event
        await eventPublisher.publish(event);
        logger.info(`Train ${train.number} RESUMED as ${newStatus}`);
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
}
export const statusMutator = new StatusMutator();
