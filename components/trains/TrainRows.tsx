'use client';

import { Train } from '@/types';
import { formatStationLabel } from '@/lib/utils/stations';
import { StatusBadge } from './StatusBadge';
import { useState, useEffect } from 'react';

interface TrainRowProps {
  train: Train;
  onSelect?: () => void;
}

/**
 * Individual train row with animations for updates
 */
export function TrainRow({ train, onSelect }: TrainRowProps) {
  const [highlight, setHighlight] = useState(false);
  const [prevTrain, setPrevTrain] = useState(train);
  
  // Highlight when train updates
  useEffect(() => {
    if (train.lastUpdated > prevTrain.lastUpdated) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 2000);
      setPrevTrain(train);
      return () => clearTimeout(timer);
    }
  }, [train, prevTrain]);
  
  return (
    <tr
      onClick={onSelect}
      className={`transition-colors duration-500 ${
      highlight ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
    } ${onSelect ? 'cursor-pointer' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
    >
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900 dark:text-white">
          {train.name}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {train.number}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">
          {formatStationLabel(train.source)} → {formatStationLabel(train.destination)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {train.route.map(formatStationLabel).join(' • ')}
        </div>
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
        {train.scheduledArrival}
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">
          {train.expectedArrival}
        </div>
        {train.delayMinutes > 0 && (
          <div className="text-xs text-orange-600 dark:text-orange-400">
            +{train.delayMinutes} min
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
        {train.platform}
      </td>
      
      <td className="px-6 py-4">
        <StatusBadge status={train.status} />
      </td>
    </tr>
  );
}
