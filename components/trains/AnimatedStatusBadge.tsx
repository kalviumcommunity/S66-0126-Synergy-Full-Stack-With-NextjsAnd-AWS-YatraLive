'use client';
import { motion } from 'framer-motion';
import { TrainStatus, TRAIN_STATUS_DISPLAY, TRAIN_STATUS_COLORS } from '@/types';

interface AnimatedStatusBadgeProps {
    status: TrainStatus;
    className?: string;
    animate?: boolean;
}

/**
 * Animated status badge with pulse effect
 */
export function AnimatedStatusBadge({
    status,
    className = '',
    animate = true
}: AnimatedStatusBadgeProps) {
    const colors = TRAIN_STATUS_COLORS[status];
    const displayText = TRAIN_STATUS_DISPLAY[status];

    return (
        <motion.span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}
            animate={animate ? {
                scale: [1, 1.05, 1],
                transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse'
                }
            } : {}}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Pulsing dot for live trains */}
            {status === 'ON_TIME' && (
                <motion.span
                    className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                />
            )}
            {displayText}
        </motion.span>
    );
}
