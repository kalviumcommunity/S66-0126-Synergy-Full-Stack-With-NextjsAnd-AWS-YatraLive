import { TrainStatus } from '../domain/train';
import { TrainInput, TrainUpdate } from '../domain/train';

/**
 * Train list query parameters
 */
export interface TrainListQuery {
  /** Page number (1-indexed) */
  page?: number;
  
  /** Items per page */
  limit?: number;
  
  /** Filter by status */
  status?: TrainStatus;
  
  /** Filter by station (trains at/coming to this station) */
  station?: string;
  
  /** Search query (train name/number) */
  search?: string;
  
  /** Sort field */
  sortBy?: 'name' | 'number' | 'status' | 'delayMinutes' | 'expectedArrival';
  
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create train request
 */
export interface CreateTrainRequest {
  train: TrainInput;
}

/**
 * Update train request
 */
export interface UpdateTrainRequest {
  id: string;
  updates: TrainUpdate;
}

/**
 * Admin control request
 */
export interface AdminControlRequest {
  /** Action to perform */
  action: 'FORCE_DELAY' | 'CHANGE_PLATFORM' | 'CANCEL_TRAIN' | 'RESUME_TRAIN';
  
  /** Train ID to act upon */
  trainId: string;
  
  /** Action parameters */
  params?: {
    delayMinutes?: number;
    platform?: number;
  };
}