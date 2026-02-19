'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Train } from '@/types';
import { AnimatedStatusBadge } from '@/components/trains/AnimatedStatusBadge';
import { JourneyTimeline } from '@/components/trains/JourneyTimeline';
import { DelayHistoryChart } from '@/components/trains/DelayHistoryChart';
import { PageTransition } from '@/components/layout/PageTransition';
import { ArrowLeft, Clock, MapPin, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrainDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [train, setTrain] = useState<Train | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'timeline' | 'history' | 'stats'>('timeline');

    useEffect(() => {
        fetchTrain();
    }, [params.id]);

    const fetchTrain = async () => {
        try {
            const response = await fetch(`/api/trains/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setTrain(data.data);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch train details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error || !train) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error || 'Train not found'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    {/* Train header */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {train.name}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {train.number} • {train.source} → {train.destination}
                                </p>
                            </div>
                            <AnimatedStatusBadge status={train.status} animate={true} />
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <StatCard
                                icon={<Clock />}
                                label="Current Delay"
                                value={train.delayMinutes > 0 ? `${train.delayMinutes} min` : 'On Time'}
                                color={train.delayMinutes > 0 ? 'orange' : 'green'}
                            />
                            <StatCard
                                icon={<MapPin />}
                                label="Platform"
                                value={train.platform.toString()}
                                color="blue"
                            />
                            <StatCard
                                icon={<Calendar />}
                                label="Scheduled"
                                value={train.scheduledArrival}
                                color="gray"
                            />
                            <StatCard
                                icon={<Activity />}
                                label="Expected"
                                value={train.expectedArrival}
                                color={train.delayMinutes > 0 ? 'orange' : 'green'}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="border-b dark:border-gray-700">
                            <nav className="flex">
                                <TabButton
                                    active={activeTab === 'timeline'}
                                    onClick={() => setActiveTab('timeline')}
                                    label="Journey Timeline"
                                />
                                <TabButton
                                    active={activeTab === 'history'}
                                    onClick={() => setActiveTab('history')}
                                    label="Delay History"
                                />
                                <TabButton
                                    active={activeTab === 'stats'}
                                    onClick={() => setActiveTab('stats')}
                                    label="Statistics"
                                />
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === 'timeline' && <JourneyTimeline train={train} />}
                            {activeTab === 'history' && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Delay History</h3>
                                    <DelayHistoryChart trainId={train.id} />
                                </div>
                            )}
                            {activeTab === 'stats' && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Train Statistics</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                            <h4 className="font-medium mb-2">Performance</h4>
                                            <div className="space-y-2">
                                                <StatRow
                                                    label="On-time performance"
                                                    value={`${Math.max(0, 100 - train.delayMinutes * 3)}%`}
                                                />
                                                <StatRow
                                                    label="Average delay"
                                                    value={`${train.delayMinutes} min`}
                                                />
                                                <StatRow
                                                    label="Total distance"
                                                    value={`${train.route.length * 100} km`}
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                            <h4 className="font-medium mb-2">Route Info</h4>
                                            <div className="space-y-2">
                                                <StatRow
                                                    label="Stations"
                                                    value={train.route.length.toString()}
                                                />
                                                <StatRow
                                                    label="Current position"
                                                    value={`Station ${train.currentStationIndex + 1} of ${train.route.length}`}
                                                />
                                                <StatRow
                                                    label="Progress"
                                                    value={`${Math.round((train.currentStationIndex + 1) / train.route.length * 100)}%`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'green' | 'orange' | 'blue' | 'gray' | 'red';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
    const colorClasses = {
        green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
        gray: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg ${colorClasses[color]}`}
        >
            <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4">{icon}</div>
                <span className="text-sm opacity-75">{label}</span>
            </div>
            <p className="text-xl font-semibold">{value}</p>
        </motion.div>
    );
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
}

function TabButton({ active, onClick, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 font-medium transition-colors relative ${active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
        >
            {label}
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
            )}
        </button>
    );
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
