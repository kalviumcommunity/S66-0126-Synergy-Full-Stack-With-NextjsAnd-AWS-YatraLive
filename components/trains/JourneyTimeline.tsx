'use client';
import { motion } from 'framer-motion';
import { Train } from '@/types';
import { getStationName } from '@/lib/utils/stations';
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
    const stationSchedule = buildRouteSchedule(train.scheduledArrival, stations.length);

    const getStationTiming = (index: number) => {
        const scheduled = stationSchedule[index] ?? train.scheduledArrival;

        if (train.status === 'CANCELLED') {
            return {
                scheduled,
                expected: 'Cancelled',
                delayed: false,
                effectiveDelay: 0,
            };
        }

        let effectiveDelay = 0;

        if (index < currentIndex) {
            effectiveDelay = Math.max(train.delayMinutes - (currentIndex - index) * 3, 0);
        } else if (index === currentIndex) {
            effectiveDelay = train.delayMinutes;
        } else if (train.delayMinutes > 0) {
            effectiveDelay = train.delayMinutes + (index - currentIndex) * 5;
        }

        return {
            scheduled,
            expected: addMinutesToTime(scheduled, effectiveDelay),
            delayed: effectiveDelay > 0,
            effectiveDelay,
        };
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
                        const stationTiming = getStationTiming(index);

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
                                                {getStationName(station)}
                                                {isCurrent && (
                                                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                                        CURRENT
                                                    </span>
                                                )}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {station}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm">
                                                Scheduled: {stationTiming.scheduled}
                                            </div>
                                            <div className={`text-sm font-medium ${stationTiming.delayed
                                                    ? 'text-orange-600 dark:text-orange-400'
                                                    : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                Expected: {stationTiming.expected}
                                                {stationTiming.delayed && isFuture && train.status !== 'CANCELLED' && (
                                                    <span className="ml-2 text-xs text-orange-500">
                                                        (est.)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delay indicator */}
                                    {stationTiming.delayed && train.status !== 'CANCELLED' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-2 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400"
                                        >
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>
                                                {isPassed
                                                    ? `Departed ${stationTiming.effectiveDelay} min late`
                                                    : isCurrent
                                                        ? `Currently ${stationTiming.effectiveDelay} min late`
                                                        : `Expected delay: ${stationTiming.effectiveDelay} min`}
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

function buildRouteSchedule(finalArrival: string, stationCount: number): string[] {
    if (stationCount <= 1) {
        return [finalArrival];
    }

    const segmentDurations = Array.from({ length: stationCount - 1 }, (_, index) => getSegmentTravelMinutes(index));
    const totalJourneyMinutes = segmentDurations.reduce((sum, duration) => sum + duration, 0);
    const originDeparture = addMinutesToTime(finalArrival, -totalJourneyMinutes);
    const schedule = [originDeparture];
    let elapsed = 0;

    for (const duration of segmentDurations) {
        elapsed += duration;
        schedule.push(addMinutesToTime(originDeparture, elapsed));
    }

    return schedule;
}

function getSegmentTravelMinutes(index: number): number {
    const pattern = [55, 70, 85, 95, 110, 80];
    return pattern[index % pattern.length];
}
