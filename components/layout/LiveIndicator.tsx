'use client';

import { useEffect, useState } from 'react';
import { ConnectionStatus } from '@/lib/hooks/useSSE';

interface LiveIndicatorProps {
  status: ConnectionStatus;
  health?: number; // ms since last heartbeat
  className?: string;
}

/**
 * Live Indicator Component
 * 
 * Shows the real-time connection status
 * 
 * ANALOGY: Like the "LIVE" light on a TV broadcast
 */
export function LiveIndicator({ status, health = 0, className = '' }: LiveIndicatorProps) {
  const [showHealth, setShowHealth] = useState(false);
  
  // Determine color and text based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          text: 'LIVE',
          pulse: true
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          text: 'CONNECTING',
          pulse: true
        };
      case 'reconnecting':
        return {
          color: 'bg-yellow-500',
          text: 'RECONNECTING',
          pulse: true
        };
      case 'disconnected':
        return {
          color: 'bg-gray-500',
          text: 'OFFLINE',
          pulse: false
        };
      case 'error':
        return {
          color: 'bg-red-500',
          text: 'ERROR',
          pulse: false
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'UNKNOWN',
          pulse: false
        };
    }
  };
  
  const config = getStatusConfig();
  
  // Health warning if > 10 seconds without heartbeat
  const isHealthy = health < 10000;
  
  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1 rounded-full ${className}`}
      onMouseEnter={() => setShowHealth(true)}
      onMouseLeave={() => setShowHealth(false)}
    >
      {/* Status dot */}
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.pulse && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${config.color} animate-ping opacity-75`} />
        )}
      </div>
      
      {/* Status text */}
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
        {config.text}
      </span>
      
      {/* Health tooltip */}
      {showHealth && status === 'connected' && (
        <div className="absolute mt-6 p-2 bg-white dark:bg-gray-800 rounded shadow-lg text-xs">
          {isHealthy ? (
            <span className="text-green-600">✓ Healthy</span>
          ) : (
            <span className="text-yellow-600">⚠ Stale ({Math.round(health / 1000)}s ago)</span>
          )}
        </div>
      )}
    </div>
  );
}