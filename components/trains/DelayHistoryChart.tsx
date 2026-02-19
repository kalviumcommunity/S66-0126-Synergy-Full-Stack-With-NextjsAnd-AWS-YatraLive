'use client';
import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrainEvent } from '@/types';

interface DelayHistoryChartProps {
    trainId: string;
}

/**
 * Chart showing delay history over time
 *
 * ANALOGY: Like a graph showing train's punctuality record
 */
export function DelayHistoryChart({ trainId }: DelayHistoryChartProps) {
    const [data, setData] = useState<Array<{ time: string; delay: number }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDelayHistory = async () => {
            try {
                const response = await fetch(`/api/trains/${trainId}/events?type=DELAY`);
                const result = await response.json();

                if (result.success) {
                    // Transform events into chart data
                    const chartData = result.data
                        .filter((event: TrainEvent) =>
                            event.type === 'TRAIN_DELAY' || event.type === 'TRAIN_RECOVERY'
                        )
                        .map((event: any) => ({
                            time: new Date(event.timestamp).toLocaleTimeString(),
                            delay: event.type === 'TRAIN_DELAY'
                                ? event.newDelayMinutes
                                : event.newDelayMinutes
                        }));

                    setData(chartData);
                }
            } catch (error) {
                console.error('Failed to fetch delay history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDelayHistory();
    }, [trainId]);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                No delay data available
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        label={{ value: 'Delay (min)', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="delay"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
