import { useState, useEffect, useCallback } from 'react';
import { Station, StationBoardEntry } from '@/types';
import { useSSE } from './useSSE';

/**
 * Station board hook
 * 
 * Manages station-specific data with real-time updates
 */
export function useStation(stationCode: string) {
  const [station, setStation] = useState<Station | null>(null);
  const [arrivals, setArrivals] = useState<StationBoardEntry[]>([]);
  const [departures, setDepartures] = useState<StationBoardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // SSE for this station (filtered updates)
  const { status } = useSSE({
    onTrainUpdate: (event) => {
      // Refresh station board when relevant trains update
      fetchStationBoard();
    }
  });
  
  /**
   * Fetch station board data
   */
  const fetchStationBoard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/station/${stationCode}`);
      const data = await response.json();
      
      if (data.success) {
        setStation(data.data.station);
        setArrivals(data.data.arrivals);
        setDepartures(data.data.departures);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch station data');
    } finally {
      setLoading(false);
    }
  }, [stationCode]);
  
  // Load initial data
  useEffect(() => {
    fetchStationBoard();
  }, [fetchStationBoard]);
  
  return {
    station,
    arrivals,
    departures,
    loading,
    error,
    connectionStatus: status,
    refresh: fetchStationBoard
  };
}