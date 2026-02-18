import { Train, TrainStatus, TrainEvent } from '@/types';
import { trainService } from '@/lib/services/trainService';
import { eventPublisher } from './utils/eventPublisher';
import { logger } from './utils/logger';
import {
    DEFAULT_PROBABILITIES,
    shouldHappen,
    getRandomDelayMagnitude
} from './config/probabilities';
import { MAX_DELAY_MINUTES, RECOVERY_RATE_PER_HOUR } from './config/constants';
import { delayMutator } from './mutators/delayMutator';
import { platformMutator } from './mutators/platformMutator';
import { statusMutator } from './mutators/statusMutator';
import { recoveryMutator } from './mutators/recoveryMutator';
/**
* Simulation Engine
*
* This is the brain of our train simulation. It decides:
* - Which trains to update
* - What kind of updates to apply
* - When events should happen
*
* ANALOGY: Like a train dispatcher who constantly monitors
* the entire network and makes decisions about every train.
*/
export class SimulationEngine {
    private probabilities = DEFAULT_PROBABILITIES;
    private isRunning = false;
    private updateCount = 0;
    /**
    * Run one simulation cycle
    * This updates a random subset of trains
    */
    async runCycle(): Promise<{
        updatedTrains: number;
        events: TrainEvent[];
    }> {
        try {
            // Get all trains from Redis
            const allTrains = await trainService.getAllTrains();
            if (allTrains.length === 0) {
                logger.warn('No trains found in database');
                return { updatedTrains: 0, events: [] };
            }
            logger.info(`Running simulation cycle on ${allTrains.length} trains`);

            // Decide how many trains to update this cycle (10-30%)
            const updateCount = Math.floor(allTrains.length * (0.1 + Math.random() * 0.2));
            const shuffled = this.shuffleArray(allTrains);
            const trainsToUpdate = shuffled.slice(0, updateCount);
            const events: TrainEvent[] = [];
            // Update each selected train
            for (const train of trainsToUpdate) {
                const trainEvents = await this.updateTrain(train);
                events.push(...trainEvents);
            }
            this.updateCount += events.length;
            logger.info(`Cycle complete: ${events.length} events generated`);
            return {
                updatedTrains: trainsToUpdate.length,
                events
            };
        } catch (error) {
            logger.error('Simulation cycle failed:', error);
            return { updatedTrains: 0, events: [] };
        }
    }
    /**
    * Update a single train - decide what happens to it
    */
    private async updateTrain(train: Train): Promise<TrainEvent[]> {
        const events: TrainEvent[] = [];
        // 1. First, handle recovery (trains making up time)
        if (train.delayMinutes > 0 && shouldHappen(this.probabilities.recovery)) {
            const recoveryEvent = await recoveryMutator.applyRecovery(train);
            if (recoveryEvent) {
                events.push(recoveryEvent);
            }
        }
        // 2. Check for new delays (only if not cancelled)
        if (train.status !== 'CANCELLED' && shouldHappen(this.probabilities.delay)) {
            const delayEvent = await delayMutator.applyDelay(train);
            if (delayEvent) {
                events.push(delayEvent);
            }
        }
        // 3. Check for platform changes
        if (shouldHappen(this.probabilities.platformChange)) {
            const platformEvent = await platformMutator.changePlatform(train);
            if (platformEvent) {
                events.push(platformEvent);
            }
        }
        // 4. Check for cancellations (rare)
        if (train.status !== 'CANCELLED' && shouldHappen(this.probabilities.cancellation)) {
            const cancelEvent = await statusMutator.cancelTrain(train);
            if (cancelEvent) {
                events.push(cancelEvent);
            }
        }
        // 5. Check for resume from cancellation (very rare)
        if (train.status === 'CANCELLED' && shouldHappen(this.probabilities.resumeFromCancellation)) {
            const resumeEvent = await statusMutator.resumeTrain(train);
            if (resumeEvent) {
                events.push(resumeEvent);
            }
        }
        return events;
    }
    /**
    * Shuffle array randomly (Fisher-Yates)
    */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    /**
    * Get simulation statistics
    */
    getStats() {
        return {
            isRunning: this.isRunning,
            totalUpdates: this.updateCount,
            probabilities: this.probabilities
        };
    }
    /**
    * Update probabilities (for admin control)
    */
    updateProbabilities(newProbs: Partial<typeof DEFAULT_PROBABILITIES>) {
        this.probabilities = {
            ...this.probabilities,
            ...newProbs
        };
        logger.info('Probabilities updated:', this.probabilities);
    }
}
// Export singleton instance
export const simulationEngine = new SimulationEngine();
