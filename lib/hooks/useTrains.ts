import { useState, useEffect, useCallback } from 'react';
import { Train, TrainEvent } from '@/types';
import { useSSE } from './useSSE';

/**
 * Train store hook
 * 
 * Manages train state and integrates with SSE for real-time updates
 * 
 * ANALOGY: Like a live train display board that updates automatically
 */
export function useTrains() {
  const [trains, setTrains] = useState<Record<string, Train>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Apply event to train state
   */
  const applyEvent = useCallback((event: TrainEvent) => {
    setTrains(prev => {
      const train = prev[event.trainId];
      if (!train) return prev;
      
      let updatedTrain = { ...train };
      
      // Apply different event types
      switch (event.type) {
        case 'TRAIN_DELAY':
          updatedTrain.delayMinutes = event.newDelayMinutes;
          updatedTrain.status = updatedTrain.delayMinutes > 0 ? 'DELAYED' : 'ON_TIME';
          // Recalculate expected arrival
          updatedTrain.expectedArrival = addMinutesToTime(
            train.scheduledArrival,
            event.newDelayMinutes
          );
          break;
          
        case 'TRAIN_RECOVERY':
          updatedTrain.delayMinutes = event.newDelayMinutes;
          updatedTrain.status = updatedTrain.delayMinutes === 0 ? 'ON_TIME' : 'DELAYED';
          updatedTrain.expectedArrival = addMinutesToTime(
            train.scheduledArrival,
            event.newDelayMinutes
          );
          break;
          
        case 'PLATFORM_CHANGE':
          updatedTrain.platform = event.newPlatform;
          break;
          
        case 'STATUS_CHANGE':
          updatedTrain.status = event.newStatus;
          if (event.newStatus === 'CANCELLED') {
            updatedTrain.delayMinutes = 0;
          }
          break;
      }
      
      updatedTrain.lastUpdated = event.timestamp;
      
      return {
        ...prev,
        [event.trainId]: updatedTrain
      };
    });
  }, []);
  
  /**
   * Handle batch updates (multiple trains at once)
   */
  const applyBatchUpdate = useCallback((updates: Array<{ trainId: string; changes: Partial<Train> }>) => {
    setTrains(prev => {
      const next = { ...prev };
      
      for (const { trainId, changes } of updates) {
        if (next[trainId]) {
          next[trainId] = {
            ...next[trainId],
            ...changes,
            lastUpdated: Date.now()
          };
        }
      }
      
      return next;
    });
  }, []);
  
  // Initialize SSE connection
  const { status, health, lastEvent } = useSSE({
    onTrainUpdate: applyEvent,
    onError: (err) => setError('SSE connection error'),
    onConnectionChange: (newStatus) => {
      if (newStatus === 'connected') {
        // Refresh data on reconnect
        fetchTrains();
      }
    }
  });
  
  /**
   * Fetch initial train data
   */
  const fetchTrains = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trains');
      const data = await response.json();
      
      if (data.success) {
        // Convert array to record
        const trainRecord: Record<string, Train> = {};
        data.data.items.forEach((train: Train) => {
          trainRecord[train.id] = train;
        });
        setTrains(trainRecord);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch trains');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load initial data
  useEffect(() => {
    fetchTrains();
  }, [fetchTrains]);
  
  // Get trains as array
  const trainsArray = Object.values(trains);
  
  // Get trains by status
  const getTrainsByStatus = useCallback((status: Train['status']) => {
    return trainsArray.filter(t => t.status === status);
  }, [trainsArray]);
  
  // Get train by ID
  const getTrain = useCallback((id: string) => {
    return trains[id];
  }, [trains]);
  
  // Search trains
  const searchTrains = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return trainsArray.filter(train => 
      train.name.toLowerCase().includes(lowerQuery) ||
      train.number.toLowerCase().includes(lowerQuery)
    );
  }, [trainsArray]);
  
  return {
    trains: trainsArray,
    trainsMap: trains,
    loading,
    error,
    connectionStatus: status,
    connectionHealth: health,
    getTrainsByStatus,
    getTrain,
    searchTrains,
    refresh: fetchTrains,
    lastUpdate: lastEvent?.timestamp
  };
}

/**
 * Helper: Add minutes to time string
 */
function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}