/**
 * Train Status - The current operational state of a train
 * 
 * Railway operations have exactly three states:
 * - ON_TIME: Running as per schedule (Green signal)
 * - DELAYED: Behind schedule (Yellow/Orange signal)
 * - CANCELLED: Not running today (Red signal)
 * 
 * Using a string union type (not enum) for better TypeScript integration
 * and simpler serialization to JSON/Redis
 */
export type TrainStatus = 'ON_TIME' | 'DELAYED' | 'CANCELLED';

/**
 * Human-readable display names for each status
 * Used in UI components for consistent labeling
 */
export const TRAIN_STATUS_DISPLAY: Record<TrainStatus, string> = {
  ON_TIME: 'On Time',
  DELAYED: 'Delayed',
  CANCELLED: 'Cancelled'
} as const;

/**
 * Status colors for UI (Tailwind classes)
 * Each status has semantic colors that users understand instantly
 */
export const TRAIN_STATUS_COLORS: Record<TrainStatus, { bg: string; text: string; badge: string }> = {
  ON_TIME: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    badge: 'bg-green-500'
  },
  DELAYED: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    badge: 'bg-orange-500'
  },
  CANCELLED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    badge: 'bg-red-500'
  }
} as const;

/**
 * Check if a status update is valid (prevents invalid transitions)
 * Example: CANCELLED → DELAYED doesn't make sense!
 */
export function isValidStatusTransition(
  current: TrainStatus,
  next: TrainStatus
): boolean {
  // CANCELLED is terminal - can't change
  if (current === 'CANCELLED') return false;
  
  // Any other transition is allowed
  return true;
}

/**
 * Train - Core domain entity representing a railway train
 * 
 * This is the MOST IMPORTANT type in our entire system.
 * Every part of the application revolves around trains.
 * 
 * Think of this as the "train specification document" that
 * every train in our system MUST follow.
 */
export interface Train {
  /**
   * Unique identifier for the train
   * Format: 'train_' + UUID v7
   * Example: 'train_018e1c7f-1c7f-7000-8000-000000000001'
   */
  id: string;
  
  /**
   * Train number - the official railway identifier
   * Example: '12301' (Rajdhani Express)
   */
  number: string;
  
  /**
   * Display name of the train
   * Example: 'Rajdhani Express'
   */
  name: string;
  
  /**
   * Source station code (where train starts)
   * Example: 'NDLS' (New Delhi)
   */
  source: string;
  
  /**
   * Destination station code (where train ends)
   * Example: 'MMCT' (Mumbai Central)
   */
  destination: string;
  
  /**
   * Current operational status
   * Affects display color, delay calculations, passenger info
   */
  status: TrainStatus;
  
  /**
   * Delay in minutes (0 = on time)
   * Positive integer, never negative
   */
  delayMinutes: number;
  
  /**
   * Current platform number
   * 1-10 for most stations, but we'll allow 1-20
   */
  platform: number;
  
  /**
   * Scheduled arrival time at CURRENT/LAST station
   * Format: 'HH:mm' in 24-hour railway time
   * Example: '14:30'
   */
  scheduledArrival: string;
  
  /**
   * Expected arrival time accounting for delays
   * Format: 'HH:mm' in 24-hour time
   * Example: '14:45' (if 15 min late)
   */
  expectedArrival: string;
  
  /**
   * Full route as array of station codes
   * Example: ['NDLS', 'CNB', 'ALD', 'BSB', 'MMCT']
   */
  route: string[];
  
  /**
   * Current station index in route
   * 0 = at source, route.length-1 = at destination
   */
  currentStationIndex: number;
  
  /**
   * Last update timestamp (Unix milliseconds)
   * Used for real-time staleness detection
   */
  lastUpdated: number;
  
  /**
   * When this train was created in our system
   * Unix milliseconds
   */
  createdAt: number;
}

/**
 * Train input type - used when creating new trains
 * Omits auto-generated fields
 */
export type TrainInput = Omit<
  Train, 
  'id' | 'lastUpdated' | 'createdAt' | 'status' | 'delayMinutes'
> & {
  status?: TrainStatus;  // Optional, defaults to ON_TIME
  delayMinutes?: number; // Optional, defaults to 0
};

/**
 * Train update type - partial updates allowed
 * All fields optional because we might update only status
 */
export type TrainUpdate = Partial<Omit<Train, 'id' | 'createdAt'>>;