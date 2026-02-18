/**
 * A journey segment between two stations
 */
export interface JourneySegment {
  fromStation: string;
  toStation: string;
  
  /** Scheduled departure from 'fromStation' */
  scheduledDeparture: string;
  
  /** Scheduled arrival at 'toStation' */
  scheduledArrival: string;
  
  /** Distance in kilometers */
  distance: number;
  
  /** Duration in minutes */
  duration: number;
}

/**
 * Complete train journey with all segments
 */
export interface Journey {
  trainId: string;
  trainNumber: string;
  trainName: string;
  
  /** All segments of the journey */
  segments: JourneySegment[];
  
  /** Total journey distance */
  totalDistance: number;
  
  /** Total journey duration */
  totalDuration: number;
  
  /** Source station */
  source: string;
  
  /** Destination station */
  destination: string;
  
  /** All stations in order */
  stations: string[];
}

/**
 * Real-time position of train along journey
 */
export interface TrainPosition {
  trainId: string;
  
  /** Current segment index */
  currentSegmentIndex: number;
  
  /** Is train at a station? */
  isAtStation: boolean;
  
  /** Current station if isAtStation true */
  currentStation?: string;
  
  /** Minutes until next station */
  minutesToNextStation?: number;
  
  /** Next station code */
  nextStation?: string;
  
  /** Estimated arrival at next station */
  estimatedArrivalAtNext?: string;
}