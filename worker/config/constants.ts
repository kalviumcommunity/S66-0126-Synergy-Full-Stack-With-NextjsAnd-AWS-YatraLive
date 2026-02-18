/**
* Worker Configuration Constants
*
* These values control how the simulation behaves.
* Think of them as the "rules of the railway" -
* how often delays happen, how long they last, etc.
*/
/**
* Default update interval in seconds
* How often the worker wakes up to update trains
*/
export const DEFAULT_UPDATE_INTERVAL = 8; // seconds
/**
* Maximum delay that can be applied (minutes)
* No train gets delayed more than this
*/
export const MAX_DELAY_MINUTES = 30;

/**
* Delay recovery rate (minutes per hour)
* How quickly trains make up lost time
*/
export const RECOVERY_RATE_PER_HOUR = 5; // minutes per hour
/**
* Worker heartbeat interval (seconds)
* How often worker updates its heartbeat in Redis
*/
export const HEARTBEAT_INTERVAL = 30; // seconds
/**
* Event retention period (hours)
* How long we keep event history
*/
export const EVENT_RETENTION_HOURS = 24;
/**
* Worker process name (for identification)
*/
export const WORKER_NAME = `train-worker-${process.pid}`;
/**
* Redis keys for worker data
*/
export const WORKER_KEYS = {
    HEARTBEAT: 'worker:heartbeat',
    LAST_RUN: 'worker:lastRun',
    UPDATES_COUNT: 'worker:updatesCount',
    STATUS: 'worker:status',
    CONTROL: 'worker:control' // For pause/resume commands
} as const;
