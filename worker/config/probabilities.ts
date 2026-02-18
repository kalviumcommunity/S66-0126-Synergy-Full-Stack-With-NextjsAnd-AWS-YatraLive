/**
* Probability Configuration
*
* These values determine how likely each type of event is.
* Like real railways, some events are rare (cancellations),
* while others are common (small delays).
*/
export interface ProbabilityConfig {
    /** Chance that a train gets delayed (0-1) */
    delay: number;
    /** Chance that a delayed train recovers (0-1) */
    recovery: number;
    /** Chance that a train changes platform (0-1) */
    platformChange: number;
    /** Chance that a train gets cancelled (0-1) */
    cancellation: number;
    /** Chance that a cancelled train resumes (0-1) */
    resumeFromCancellation: number;
    /** Distribution of delay magnitudes */
    delayMagnitude: {
        small: number; // 1-5 min
        medium: number; // 6-15 min
        large: number; // 16-30 min
    };
}
/**
* Default probabilities - tuned to feel realistic
*
* ANALOGY:
* - Most trains run on time (70% of updates nothing changes)
* - Small delays are common (20% chance)
* - Platform changes happen occasionally (8% chance)
* - Cancellations are rare (2% chance)
*/
export const DEFAULT_PROBABILITIES: ProbabilityConfig = {
    // Event probabilities (sum should be <= 1)
    delay: 0.20, // 20% chance of delay
    recovery: 0.15, // 15% chance of recovery
    platformChange: 0.08, // 8% chance of platform change
    cancellation: 0.02, // 2% chance of cancellation
    resumeFromCancellation: 0.01, // 1% chance (cancelled trains rarely resume)
    // Delay magnitude distribution
    delayMagnitude: {
        small: 0.6, // 60% of delays are small
        medium: 0.3, // 30% are medium
        large: 0.1 // 10% are large
    }
};
/**
* Get a random delay magnitude based on probabilities
*/
export function getRandomDelayMagnitude(config = DEFAULT_PROBABILITIES): number {
    const rand = Math.random();
    const { small, medium, large } = config.delayMagnitude;
    if (rand < small) {
        return Math.floor(Math.random() * 5) + 1; // 1-5 minutes
    } else if (rand < small + medium) {
        return Math.floor(Math.random() * 10) + 6; // 6-15 minutes
    } else {
        return Math.floor(Math.random() * 15) + 16; // 16-30 minutes
    }
}
/**
* Check if an event should happen based on probability
*/
export function shouldHappen(probability: number): boolean {
    return Math.random() < probability;
}
