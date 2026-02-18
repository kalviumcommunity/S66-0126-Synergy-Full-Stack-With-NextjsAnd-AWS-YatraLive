// Domain types
export * from './domain/train';
export * from './domain/station';
export * from './domain/journey';

// Event types
export * from './events/train-events';

// API types
export * from './api/requests';
export * from './api/responses';

// Redis types
export * from './redis/keys';

// Type guards
export * from './guards';

// Re-export commonly used types for convenience
// export type {
//   // Train types
//   Train,
//   TrainStatus,
//   TrainInput,
//   TrainUpdate,
  
//   // Station types
//   Station,
//   Platform,
//   StationBoardEntry,
  
//   // Journey types
//   Journey,
//   JourneySegment,
//   TrainPosition,
  
//   // Event types
//   TrainEvent,
//   TrainDelayEvent,
//   TrainRecoveryEvent,
//   TrainPlatformChangeEvent,
//   TrainStatusChangeEvent,
  
//   // API types
//   ApiResponse,
//   PaginatedResponse,
//   TrainListQuery,
//   CreateTrainRequest,
//   UpdateTrainRequest,
//   AdminControlRequest,
//   TrainListResponse,
//   TrainResponse,
//   StationBoardResponse,
//   SystemHealthResponse,
//   SSEEvent,
  
//   // Redis types
//   REDIS_KEYS,
//   TRAIN_HASH_FIELDS,
//   TrainHashField
// } from './types';