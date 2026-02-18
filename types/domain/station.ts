import { TrainStatus } from './train';

/**
 * Station code - 3-5 letter railway code
 * Examples: NDLS (New Delhi), BCT (Mumbai Central), HWH (Howrah)
 */
export type StationCode = string;

/**
 * Station - A railway station where trains stop
 */
export interface Station {
  /** Station code (primary identifier) */
  code: StationCode;
  
  /** Full station name */
  name: string;
  
  /** City where station is located */
  city: string;
  
  /** State where station is located */
  state: string;
  
  /** Number of platforms at this station */
  platformCount: number;
  
  /** List of train numbers that typically stop here */
  trains: string[];
  
  /** Station facilities (optional) */
  facilities?: {
    hasParking: boolean;
    hasATM: boolean;
    hasFood: boolean;
    hasWaitingRoom: boolean;
  };
}

/**
 * Platform information at a station
 */
export interface Platform {
  /** Platform number */
  number: number;
  
  /** Current train at platform (if any) */
  currentTrainId?: string;
  
  /** Next scheduled train */
  nextTrainId?: string;
  
  /** Is platform accessible? */
  isActive: boolean;
}

/**
 * Station arrival/departure board entry
 * What passengers see on the display
 */
export interface StationBoardEntry {
  trainId: string;
  trainName: string;
  trainNumber: string;
  
  /** 'ARRIVAL' or 'DEPARTURE' */
  type: 'ARRIVAL' | 'DEPARTURE';
  
  /** For arrivals: from this station, for departures: to this station */
  connectedStation: string;
  
  scheduledTime: string;
  expectedTime: string;
  platform: number;
  status: TrainStatus;
  delayMinutes: number;
}