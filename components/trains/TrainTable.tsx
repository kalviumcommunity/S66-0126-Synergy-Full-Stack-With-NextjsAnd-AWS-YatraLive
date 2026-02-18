'use client';

import { useState, useMemo } from 'react';
import { Train } from '@/types';
import { TrainRow } from './TrainRows';
import { LiveIndicator } from '../layout/LiveIndicator';
import { useTrains } from '@/lib/hooks/useTrains';

/**
 * Train Table Component
 * 
 * Displays all trains with real-time updates
 * 
 * ANALOGY: Like the main departure board at a major station
 */
export function TrainTable() {
  const {
    trains,
    loading,
    error,
    connectionStatus,
    connectionHealth,
    getTrainsByStatus
  } = useTrains();
  
  const [filter, setFilter] = useState<'all' | 'ON_TIME' | 'DELAYED' | 'CANCELLED'>('all');
  const [search, setSearch] = useState('');
  
  // Filter trains
  const filteredTrains = useMemo(() => {
    let filtered = trains;
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.number.toLowerCase().includes(searchLower) ||
        t.source.toLowerCase().includes(searchLower) ||
        t.destination.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by expected arrival
    return filtered.sort((a, b) => 
      a.expectedArrival.localeCompare(b.expectedArrival)
    );
  }, [trains, filter, search]);
  
  // Get counts for each status
  const counts = {
    all: trains.length,
    ON_TIME: getTrainsByStatus('ON_TIME').length,
    DELAYED: getTrainsByStatus('DELAYED').length,
    CANCELLED: getTrainsByStatus('CANCELLED').length
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with live indicator */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Train Status</h1>
        <LiveIndicator 
          status={connectionStatus} 
          health={connectionHealth}
        />
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            count={counts.all}
            label="All"
          />
          <FilterButton
            active={filter === 'ON_TIME'}
            onClick={() => setFilter('ON_TIME')}
            count={counts.ON_TIME}
            label="On Time"
            color="green"
          />
          <FilterButton
            active={filter === 'DELAYED'}
            onClick={() => setFilter('DELAYED')}
            count={counts.DELAYED}
            label="Delayed"
            color="orange"
          />
          <FilterButton
            active={filter === 'CANCELLED'}
            onClick={() => setFilter('CANCELLED')}
            count={counts.CANCELLED}
            label="Cancelled"
            color="red"
          />
        </div>
        
        <input
          type="text"
          placeholder="Search trains..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
      
      {/* Train table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Train
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Scheduled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Expected
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTrains.map((train) => (
              <TrainRow key={train.id} train={train} />
            ))}
          </tbody>
        </table>
        
        {/* Empty state */}
        {filteredTrains.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No trains found matching your criteria
          </div>
        )}
      </div>
      
      {/* Footer with update info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
        {filteredTrains.length} trains shown • Updates in real-time
      </div>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  count: number;
  label: string;
  color?: 'green' | 'orange' | 'red';
}

function FilterButton({ active, onClick, count, label, color }: FilterButtonProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  };
  
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        active
          ? color
            ? colorClasses[color]
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label} <span className="ml-1 text-xs opacity-75">({count})</span>
    </button>
  );
}