import { redis } from '../redis/client';
import { Station, StationBoardEntry, Train } from '../../types';
import { getStationKey } from '../../types/redis/keys';
import { trainService } from './trainService';

export class StationService {
  async getStation(code: string): Promise<Station | null> {
    const data = await redis.hgetall(getStationKey(code));
    if (Object.keys(data).length === 0) return null;
    const station: Station = {
      code: data.code,
      name: data.name,
      city: data.city,
      state: data.state,
      platformCount: parseInt(data.platformCount, 10),
      trains: JSON.parse(data.trains || '[]'),
      facilities: data.facilities ? JSON.parse(data.facilities) : undefined,
    };
    return station;
  }

  async getStationBoard(stationCode: string): Promise<{
    station: Station | null;
    arrivals: StationBoardEntry[];
    departures: StationBoardEntry[];
  }> {
    const station = await this.getStation(stationCode);
    if (!station) return { station: null, arrivals: [], departures: [] };

    const allTrains = await trainService.getAllTrains();
    const arrivals: StationBoardEntry[] = [];
    const departures: StationBoardEntry[] = [];

    for (const train of allTrains) {
      const stationIndex = train.route.indexOf(stationCode);
      if (stationIndex === -1) continue;
      const isAtStation = train.currentStationIndex === stationIndex;
      const isPast = train.currentStationIndex > stationIndex;
      const isFuture = train.currentStationIndex < stationIndex;
      const entry: StationBoardEntry = {
        trainId: train.id,
        trainName: train.name,
        trainNumber: train.number,
        type: 'ARRIVAL',
        connectedStation: stationIndex === 0 ? train.destination : train.source,
        scheduledTime: train.scheduledArrival,
        expectedTime: train.expectedArrival,
        platform: train.platform,
        status: train.status,
        delayMinutes: train.delayMinutes,
      };

      if (stationIndex === 0) {
        entry.type = 'DEPARTURE';
        departures.push(entry);
      } else if (stationIndex === train.route.length - 1) {
        entry.type = 'ARRIVAL';
        arrivals.push(entry);
      } else {
        const arrivalEntry = { ...entry, type: 'ARRIVAL' as const };
        const departureEntry = { ...entry, type: 'DEPARTURE' as const };
        if (!isPast) arrivals.push(arrivalEntry);
        if (!isPast) departures.push(departureEntry);
      }
    }

    arrivals.sort((a, b) => a.expectedTime.localeCompare(b.expectedTime));
    departures.sort((a, b) => a.expectedTime.localeCompare(b.expectedTime));
    return { station, arrivals, departures };
  }
}

export const stationService = new StationService();
