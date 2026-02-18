import { Train } from './domain/train';
import { Station } from './domain/station';
import { TrainEvent } from './events/train-events';
import { TRAIN_HASH_FIELDS } from './redis/keys';

/**
 * Type guard for Train
 * Checks if an unknown object is a valid Train
 */
export function isValidTrain(obj: unknown): obj is Train {
  if (!obj || typeof obj !== 'object') return false;
  
  const train = obj as Record<string, unknown>;
  
  // Check required fields exist with correct types
  return (
    typeof train.id === 'string' &&
    typeof train.number === 'string' &&
    typeof train.name === 'string' &&
    typeof train.source === 'string' &&
    typeof train.destination === 'string' &&
    typeof train.status === 'string' &&
    ['ON_TIME', 'DELAYED', 'CANCELLED'].includes(train.status as string) &&
    typeof train.delayMinutes === 'number' &&
    train.delayMinutes >= 0 &&
    typeof train.platform === 'number' &&
    train.platform >= 1 &&
    typeof train.scheduledArrival === 'string' &&
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(train.scheduledArrival) &&
    typeof train.expectedArrival === 'string' &&
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(train.expectedArrival) &&
    Array.isArray(train.route) &&
    train.route.every(station => typeof station === 'string') &&
    typeof train.currentStationIndex === 'number' &&
    train.currentStationIndex >= 0 &&
    train.currentStationIndex < (train.route as string[]).length &&
    typeof train.lastUpdated === 'number' &&
    typeof train.createdAt === 'number'
  );
}

/**
 * Type guard for Station
 */
export function isValidStation(obj: unknown): obj is Station {
  if (!obj || typeof obj !== 'object') return false;
  
  const station = obj as Record<string, unknown>;
  
  return (
    typeof station.code === 'string' &&
    typeof station.name === 'string' &&
    typeof station.city === 'string' &&
    typeof station.state === 'string' &&
    typeof station.platformCount === 'number' &&
    station.platformCount > 0 &&
    Array.isArray(station.trains) &&
    station.trains.every(t => typeof t === 'string')
  );
}

/**
 * Type guard for TrainEvent
 */
export function isTrainEvent(obj: unknown): obj is TrainEvent {
  if (!obj || typeof obj !== 'object') return false;
  
  const event = obj as Record<string, unknown>;
  
  if (typeof event.type !== 'string') return false;
  
  // Type narrowing based on event type
  switch (event.type) {
    case 'TRAIN_DELAY':
      return (
        typeof event.previousDelayMinutes === 'number' &&
        typeof event.newDelayMinutes === 'number' &&
        typeof event.delayIncrease === 'number'
      );
      
    case 'TRAIN_RECOVERY':
      return (
        typeof event.previousDelayMinutes === 'number' &&
        typeof event.newDelayMinutes === 'number' &&
        typeof event.recoveredMinutes === 'number'
      );
      
    case 'PLATFORM_CHANGE':
      return (
        typeof event.previousPlatform === 'number' &&
        typeof event.newPlatform === 'number'
      );
      
    case 'STATUS_CHANGE':
      return (
        typeof event.previousStatus === 'string' &&
        ['ON_TIME', 'DELAYED', 'CANCELLED'].includes(event.previousStatus) &&
        typeof event.newStatus === 'string' &&
        ['ON_TIME', 'DELAYED', 'CANCELLED'].includes(event.newStatus)
      );
      
    default:
      return false;
  }
}

/**
 * Generic type guard factory - creates a type guard for arrays
 */
export function isArrayOf<T>(
  itemGuard: (item: unknown) => item is T
): (obj: unknown) => obj is T[] {
  return (obj: unknown): obj is T[] => {
    return Array.isArray(obj) && obj.every(itemGuard);
  };
}

/**
 * Type guard for Train array
 */
export const isTrainArray = isArrayOf(isValidTrain);

/**
 * Type guard for Station array
 */
export const isStationArray = isArrayOf(isValidStation);

/**
 * Type guard for Event array
 */
export const isEventArray = isArrayOf(isTrainEvent);

/**
 * Validate train data from Redis
 * Redis returns strings, so we need to parse and validate
 */
export function parseTrainFromRedis(data: Record<string, string>): Train | null {
  try {
    const train: Partial<Train> = {
      id: data[TRAIN_HASH_FIELDS.ID],
      number: data[TRAIN_HASH_FIELDS.NUMBER],
      name: data[TRAIN_HASH_FIELDS.NAME],
      source: data[TRAIN_HASH_FIELDS.SOURCE],
      destination: data[TRAIN_HASH_FIELDS.DESTINATION],
      status: data[TRAIN_HASH_FIELDS.STATUS] as Train['status'],
      delayMinutes: parseInt(data[TRAIN_HASH_FIELDS.DELAY_MINUTES], 10),
      platform: parseInt(data[TRAIN_HASH_FIELDS.PLATFORM], 10),
      scheduledArrival: data[TRAIN_HASH_FIELDS.SCHEDULED_ARRIVAL],
      expectedArrival: data[TRAIN_HASH_FIELDS.EXPECTED_ARRIVAL],
      route: JSON.parse(data[TRAIN_HASH_FIELDS.ROUTE] || '[]'),
      currentStationIndex: parseInt(data[TRAIN_HASH_FIELDS.CURRENT_STATION_INDEX] || '0', 10),
      lastUpdated: parseInt(data[TRAIN_HASH_FIELDS.LAST_UPDATED], 10),
      createdAt: parseInt(data[TRAIN_HASH_FIELDS.CREATED_AT], 10)
    };
    
    return isValidTrain(train) ? (train as Train) : null;
  } catch (error) {
    console.error('Failed to parse train from Redis:', error);
    return null;
  }
}

/**
 * Validate train data for API request
 * Ensures all required fields present with correct types
 */
export function validateTrainInput(data: unknown): Train['id'] | null {
  if (!data || typeof data !== 'object') return null;
  
  const input = data as Record<string, unknown>;
  
  // Check required fields
  if (
    typeof input.number !== 'string' ||
    typeof input.name !== 'string' ||
    typeof input.source !== 'string' ||
    typeof input.destination !== 'string' ||
    !Array.isArray(input.route) ||
    typeof input.currentStationIndex !== 'number'
  ) {
    return null;
  }
  
  // Validate route
  if (!input.route.every(station => typeof station === 'string')) {
    return null;
  }
  
  // Validate time format
  if (
    typeof input.scheduledArrival === 'string' &&
    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input.scheduledArrival)
  ) {
    return null;
  }
  
  // Build valid input object
  const trainInput: any = {
    number: input.number,
    name: input.name,
    source: input.source,
    destination: input.destination,
    route: input.route as string[],
    currentStationIndex: input.currentStationIndex,
    scheduledArrival: input.scheduledArrival as string,
    expectedArrival: (input.expectedArrival as string) || (input.scheduledArrival as string),
    platform: typeof input.platform === 'number' ? input.platform : 1,
    status: (input.status as Train['status']) || 'ON_TIME',
    delayMinutes: typeof input.delayMinutes === 'number' ? input.delayMinutes : 0
  };
  
  return trainInput;
}