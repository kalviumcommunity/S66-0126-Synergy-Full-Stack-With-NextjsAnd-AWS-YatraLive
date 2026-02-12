export type TrainStatus = 'ON_TIME' | 'DELAYED' | 'CANCELLED';

export interface Train {
  id: string;
  name: string;
  number: string;
  source: string;
  destination: string;
  status: TrainStatus;
  delayMinutes: number;
  platform: number;
  scheduledArrival: string;
  expectedArrival: string;
  lastUpdated: number;
}
