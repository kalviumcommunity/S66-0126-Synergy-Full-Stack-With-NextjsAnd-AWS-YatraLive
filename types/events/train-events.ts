import { TrainStatus } from '../domain/train';

/**
 * Base event interface that all events extend
 * Every event in the system follows this structure
 */
export interface BaseEvent {
  /** Unique event ID */
  id: string;
  
  /** Type of event - discriminator for discriminated unions */
  type: string;
  
  /** When the event occurred (Unix ms) */
  timestamp: number;
  
  /** Which train this event affects */
  trainId: string;
}

/**
 * Train delay event - when a train gets delayed
 */
export interface TrainDelayEvent extends BaseEvent {
  type: 'TRAIN_DELAY';
  
  /** Previous delay (before this event) */
  previousDelayMinutes: number;
  
  /** New delay (after this event) */
  newDelayMinutes: number;
  
  /** How many minutes added */
  delayIncrease: number;
  
  /** Reason for delay (simulated or real) */
  reason?: string;
}

/**
 * Train recovery event - when delay decreases
 */
export interface TrainRecoveryEvent extends BaseEvent {
  type: 'TRAIN_RECOVERY';
  
  /** Previous delay */
  previousDelayMinutes: number;
  
  /** New delay */
  newDelayMinutes: number;
  
  /** Minutes recovered */
  recoveredMinutes: number;
}

/**
 * Platform change event - train changes platform
 */
export interface TrainPlatformChangeEvent extends BaseEvent {
  type: 'PLATFORM_CHANGE';
  
  /** Previous platform */
  previousPlatform: number;
  
  /** New platform */
  newPlatform: number;
}

/**
 * Status change event - train status changes
 */
export interface TrainStatusChangeEvent extends BaseEvent {
  type: 'STATUS_CHANGE';
  
  /** Previous status */
  previousStatus: TrainStatus;
  
  /** New status */
  newStatus: TrainStatus;
}

/**
 * Discriminated union of all possible train events
 * TypeScript can narrow types based on 'type' property
 */
export type TrainEvent = 
  | TrainDelayEvent
  | TrainRecoveryEvent
  | TrainPlatformChangeEvent
  | TrainStatusChangeEvent;