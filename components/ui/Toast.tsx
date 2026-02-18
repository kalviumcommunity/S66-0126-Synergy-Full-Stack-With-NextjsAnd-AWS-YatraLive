'use client';

import { useEffect, useState } from 'react';
import { TrainEvent } from '@/types';
import { X } from 'lucide-react';

interface ToastProps {
  event: TrainEvent;
  onDismiss: () => void;
  duration?: number;
}

type ToastColor = 'orange' | 'blue' | 'red' | 'green' | 'gray';

/**
 * Toast notification for major train events
 * 
 * ANALOGY: Like station announcements for important changes
 */
export function Toast({ event, onDismiss, duration = 5000 }: ToastProps) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade out
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);
  
  if (!visible) return null;
  
  const getEventMessage = (): { title: string; message: string; color: ToastColor } => {
    switch (event.type) {
      case 'TRAIN_DELAY':
        return {
          title: 'Train Delayed',
          message: `Train delayed by ${event.delayIncrease} minutes`,
          color: 'orange'
        };
      case 'PLATFORM_CHANGE':
        return {
          title: 'Platform Change',
          message: `Platform changed from ${event.previousPlatform} to ${event.newPlatform}`,
          color: 'blue'
        };
      case 'STATUS_CHANGE':
        return {
          title: 'Status Change',
          message: `Train ${event.newStatus === 'CANCELLED' ? 'cancelled' : 'resumed'}`,
          color: event.newStatus === 'CANCELLED' ? 'red' : 'green'
        };
      default:
        return {
          title: 'Train Update',
          message: 'Train status updated',
          color: 'gray'
        };
    }
  };
  
  const { title, message, color } = getEventMessage();
  
  const colorClasses = {
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    red: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    gray: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
  };
  
  return (
    <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${colorClasses[color]} transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Train {event.trainId}
          </p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}