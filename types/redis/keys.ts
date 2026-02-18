import { TrainStatus } from '../domain/train';

/**
 * Redis key prefixes - Think of these as folders in a filing system
 * Each prefix represents a different type of data
 */
export const REDIS_KEYS = {
  /** Train hash keys: 'train:{id}' -> stores train data */
  TRAIN: 'train',
  
  /** All train IDs set: 'trains' -> set of all train IDs */
  TRAINS_ALL: 'trains',
  
  /** Trains by status: 'trains:status:{status}' -> set of train IDs with given status */
  TRAINS_BY_STATUS: 'trains:status',
  
  /** Trains by station: 'trains:station:{stationCode}' -> trains at/coming to station */
  TRAINS_BY_STATION: 'trains:station',
  
  /** Station data: 'station:{code}' -> station details */
  STATION: 'station',
  
  /** All stations set: 'stations' -> set of all station codes */
  STATIONS_ALL: 'stations',
  
  /** Event stream: 'events:train:{trainId}' -> list of events for train */
  EVENTS_TRAIN: 'events:train',
  
  /** Recent events: 'events:recent' -> sorted set by timestamp */
  EVENTS_RECENT: 'events:recent',
  
  /** Worker heartbeat: 'worker:heartbeat' -> last worker run timestamp */
  WORKER_HEARTBEAT: 'worker:heartbeat',
  
  /** System metrics: 'system:metrics' -> various system stats */
  SYSTEM_METRICS: 'system:metrics',
} as const;

/**
 * Generate Redis key for a train
 * @param trainId - Train ID
 * @returns Redis key string
 */
export function getTrainKey(trainId: string): string {
  return `${REDIS_KEYS.TRAIN}:${trainId}`;
}

/**
 * Generate Redis key for trains by status set
 * @param status - Train status
 * @returns Redis key string
 */
export function getTrainsByStatusKey(status: TrainStatus): string {
  return `${REDIS_KEYS.TRAINS_BY_STATUS}:${status}`;
}

/**
 * Generate Redis key for trains at station
 * @param stationCode - Station code
 * @returns Redis key string
 */
export function getTrainsByStationKey(stationCode: string): string {
  return `${REDIS_KEYS.TRAINS_BY_STATION}:${stationCode}`;
}

/**
 * Generate Redis key for station
 * @param stationCode - Station code
 * @returns Redis key string
 */
export function getStationKey(stationCode: string): string {
  return `${REDIS_KEYS.STATION}:${stationCode}`;
}

/**
 * Generate Redis key for train events
 * @param trainId - Train ID
 * @returns Redis key string
 */
export function getTrainEventsKey(trainId: string): string {
  return `${REDIS_KEYS.EVENTS_TRAIN}:${trainId}`;
}

/**
 * Redis hash field names for train data
 * Using const assertion for type safety
 */
export const TRAIN_HASH_FIELDS = {
  ID: 'id',
  NUMBER: 'number',
  NAME: 'name',
  SOURCE: 'source',
  DESTINATION: 'destination',
  STATUS: 'status',
  DELAY_MINUTES: 'delayMinutes',
  PLATFORM: 'platform',
  SCHEDULED_ARRIVAL: 'scheduledArrival',
  EXPECTED_ARRIVAL: 'expectedArrival',
  ROUTE: 'route',
  CURRENT_STATION_INDEX: 'currentStationIndex',
  LAST_UPDATED: 'lastUpdated',
  CREATED_AT: 'createdAt'
} as const;

/**
 * Type representing train hash fields
 */
export type TrainHashField = typeof TRAIN_HASH_FIELDS[keyof typeof TRAIN_HASH_FIELDS];