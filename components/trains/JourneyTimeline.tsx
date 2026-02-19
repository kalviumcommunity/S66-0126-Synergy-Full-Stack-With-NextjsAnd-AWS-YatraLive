'use client';
import { motion } from 'framer-motion';
import { Train } from '@/types';
import { CheckCircle, Clock, MapPin, AlertTriangle } from 'lucide-react';

interface JourneyTimelineProps {
    train: Train;
}

/**
 * Journey timeline showing train's progress along route
 *
 * ANALOGY: Like the track diagram showing where the train is
 */
export function JourneyTimeline({ train }: JourneyTimelineProps) {
    const stations = train.route;
    const currentIndex = train.currentStationIndex;

    // Calculate if train is delayed at each station
    const getStationDelay = (index: number) => {
        if (index <= currentIndex) {
            // Stations passed - show actual vs scheduled
            return {
                delayed: train.delayMinutes > 0,
                time: train.expectedArrival
            };
        } else {
            // Future stations - show estimated
            // Simple propagation: each station adds 5 minutes if delayed
            const estimatedDelay = train.delayMinutes > 0
                ? train.delayMinutes + (index - currentIndex) * 5
                : 0;
            return {
                delayed: estimatedDelay > 0,
                time: addMinutesToTime(train.scheduledArrival, estimatedDelay)
            };
        }
    };

    return (
        <div className="py-6">
            <h3 className="text-lg font-semibold mb-4">Journey Timeline</h3>
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />

                {/* Stations */}
                <div className="space-y-6">
                    {stations.map((station, index) => {
                        const isPassed = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isFuture = index > currentIndex;
                        const stationDelay = getStationDelay(index);

                        return (
                            <motion.div
                                key={station}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex items-start gap-4"
                            >
                                {/* Station marker */}
                                <div className="relative z-10">
                                    {isPassed ? (
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                    ) : isCurrent ? (
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                boxShadow: [
                                                    '0 0 0 0 rgba(59, 130, 246, 0.7)',
                                                    '0 0 0 10px rgba(59, 130, 246, 0)',
                                                    '0 0 0 0 rgba(59, 130, 246, 0)'
                                                ]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
                                        >
                                            <MapPin className="w-4 h-4 text-white" />
                                        </motion.div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Station info */}
                                <div className="flex-1 pb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">
                                                {station}
                                                {isCurrent && (
                                                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                                        CURRENT
                                                    </span>
                                                )}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {getStationName(station)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm">
                                                Scheduled: {train.scheduledArrival}
                                            </div>
                                            <div className={`text-sm font-medium ${stationDelay.delayed
                                                    ? 'text-orange-600 dark:text-orange-400'
                                                    : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                Expected: {stationDelay.time}
                                                {stationDelay.delayed && isFuture && (
                                                    <span className="ml-2 text-xs text-orange-500">
                                                        (est.)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delay indicator */}
                                    {stationDelay.delayed && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-2 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400"
                                        >
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>
                                                {isPassed
                                                    ? `Departed ${train.delayMinutes} min late`
                                                    : isCurrent
                                                        ? `Currently ${train.delayMinutes} min late`
                                                        : `Expected delay: ${train.delayMinutes + (index - currentIndex) * 5} min`}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Helper functions
function addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

function getStationName(code: string): string {
    const stations: Record<string, string> = {
        NDLS: 'New Delhi',
        HWH: 'Howrah',
        MMCT: 'Mumbai Central',
        SBC: 'KSR Bengaluru',
        CNB: 'Kanpur Central',
        BCT: 'Mumbai Central',
        MAS: 'Chennai Central',
        PURI: 'Puri',
        GAYA: 'Gaya',
        ALD: 'Prayagraj'
    };
    return stations[code] || code;
}
