'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Train } from '@/types';
import { StatusBadge } from './StatusBadge';
import { useState, useEffect } from 'react';

interface AnimatedTrainRowProps {
    train: Train;
    index: number;
}

/**
 * Animated train row with smooth updates
 *
 * ANALOGY: Like a digital display that smoothly updates
 * instead of flickering - easy on the eyes
 */
export function AnimatedTrainRow({ train, index }: AnimatedTrainRowProps) {
    const [highlight, setHighlight] = useState(false);
    const [prevTrain, setPrevTrain] = useState(train);

    // Detect changes and trigger highlight animation
    useEffect(() => {
        if (train.lastUpdated > prevTrain.lastUpdated) {
            setHighlight(true);
            const timer = setTimeout(() => setHighlight(false), 2000);
            setPrevTrain(train);
            return () => clearTimeout(timer);
        }
    }, [train, prevTrain]);

    // Determine what changed for visual indicator
    const getChangeIndicator = () => {
        if (train.status !== prevTrain.status) {
            return { type: 'status', from: prevTrain.status, to: train.status };
        }
        if (train.delayMinutes !== prevTrain.delayMinutes) {
            return { type: 'delay', from: prevTrain.delayMinutes, to: train.delayMinutes };
        }
        if (train.platform !== prevTrain.platform) {
            return { type: 'platform', from: prevTrain.platform, to: train.platform };
        }
        return null;
    };

    const change = getChangeIndicator();

    return (
        <motion.tr
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`transition-colors duration-500 ${highlight ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-700/50`}
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
                    {train.source} → {train.destination}
                </div>
                <motion.div
                    className="text-xs text-gray-500 dark:text-gray-400 flex gap-1 flex-wrap"
                    animate={{ scale: change?.type === 'route' ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {train.route.map((station, i) => (
                        <span key={station}>
                            {station}
                            {i < train.route.length - 1 && (
                                <span className="mx-1 text-gray-400">→</span>
                            )}
                        </span>
                    ))}
                </motion.div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {train.scheduledArrival}
            </td>
            <td className="px-6 py-4">
                <motion.div
                    animate={{
                        scale: change?.type === 'delay' ? [1, 1.2, 1] : 1,
                        color: change?.type === 'delay'
                            ? ['#000', '#f59e0b', '#000']
                            : undefined
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-sm text-gray-900 dark:text-white"
                >
                    {train.expectedArrival}
                </motion.div>
                {train.delayMinutes > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs text-orange-600 dark:text-orange-400"
                    >
                        +{train.delayMinutes} min
                    </motion.div>
                )}
            </td>
            <td className="px-6 py-4">
                <motion.div
                    animate={{
                        scale: change?.type === 'platform' ? [1, 1.3, 1] : 1,
                        backgroundColor: change?.type === 'platform'
                            ? ['transparent', '#3b82f6', 'transparent']
                            : undefined
                    }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm"
                >
                    {train.platform}
                </motion.div>
            </td>
            <td className="px-6 py-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={train.status}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <StatusBadge status={train.status} />
                    </motion.div>
                </AnimatePresence>
            </td>
            {/* Change indicator toast */}
            <AnimatePresence>
                {change && highlight && (
                    <motion.td
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute right-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 text-xs"
                        style={{ position: 'absolute', marginLeft: '1rem' }}
                    >
                        {change.type === 'status' && (
                            <>Status: {change.from} → {change.to}</>
                        )}
                        {change.type === 'delay' && (
                            <>Delay: {change.from} → {change.to} min</>
                        )}
                        {change.type === 'platform' && (
                            <>Platform: {change.from} → {change.to}</>
                        )}
                    </motion.td>
                )}
            </AnimatePresence>
        </motion.tr>
    );
}
