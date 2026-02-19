'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Calendar, Activity } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { PageTransition } from '@/components/layout/PageTransition';
import { AnimatedStatusBadge } from '@/components/trains/AnimatedStatusBadge';
import { DelayHistoryChart } from '@/components/trains/DelayHistoryChart';
import { JourneyTimeline } from '@/components/trains/JourneyTimeline';
import type { Train } from '@/types';

import { JourneyHistoryChart } from '../../../components/trains/JourneyHistoryChart';

export default function TrainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'history' | 'analytics' | 'stats'>(
    'timeline'
  );

  const fetchTrain = useCallback(async () => {
    try {
      const response = await fetch(`/api/trains/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setTrain(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch train details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchTrain();
  }, [fetchTrain]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">{error || 'Train not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
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
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Train header */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{train.name}</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {train.number} • {train.source} → {train.destination}
                </p>
              </div>
              <AnimatedStatusBadge status={train.status} animate={true} />
            </div>

            {/* Quick stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
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
          <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
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
                  active={activeTab === 'analytics'}
                  onClick={() => setActiveTab('analytics')}
                  label="Analytics"
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
                  <h3 className="mb-4 text-lg font-semibold">Delay History</h3>
                  <DelayHistoryChart trainId={train.id} />
                </div>
              )}
              {activeTab === 'analytics' && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Journey Analytics</h3>
                  <JourneyHistoryChart trainId={train.id} />
                </div>
              )}
              {activeTab === 'stats' && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Train Statistics</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                      <h4 className="mb-2 font-medium">Performance</h4>
                      <div className="space-y-2">
                        <StatRow
                          label="On-time performance"
                          value={`${Math.max(0, 100 - train.delayMinutes * 3)}%`}
                        />
                        <StatRow label="Average delay" value={`${train.delayMinutes} min`} />
                        <StatRow label="Total distance" value={`${train.route.length * 100} km`} />
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                      <h4 className="mb-2 font-medium">Route Info</h4>
                      <div className="space-y-2">
                        <StatRow label="Stations" value={train.route.length.toString()} />
                        <StatRow
                          label="Current position"
                          value={`Station ${train.currentStationIndex + 1} of ${train.route.length}`}
                        />
                        <StatRow
                          label="Progress"
                          value={`${Math.round(((train.currentStationIndex + 1) / train.route.length) * 100)}%`}
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
    gray: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="mb-1 flex items-center gap-2">
        <div className="h-4 w-4">{icon}</div>
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
      className={`relative px-6 py-3 font-medium transition-colors ${
        active
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-500"
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
