'use client';

import { TrainStatus, TRAIN_STATUS_DISPLAY, TRAIN_STATUS_COLORS } from '@/types';

interface StatusBadgeProps {
  status: TrainStatus;
  className?: string;
}

/**
 * Status badge with appropriate colors
 */
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors = TRAIN_STATUS_COLORS[status];
  const displayText = TRAIN_STATUS_DISPLAY[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}>
      {displayText}
    </span>
  );
}