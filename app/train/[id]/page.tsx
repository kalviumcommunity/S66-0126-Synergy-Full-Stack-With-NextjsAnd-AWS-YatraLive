'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Calendar, Activity } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { PageTransition } from '@/components/layout/PageTransition';
import { AnimatedStatusBadge } from '@/components/trains/AnimatedStatusBadge';
import { JourneyTimeline } from '@/components/trains/JourneyTimeline';
import { formatStationLabel } from '@/lib/utils/stations';
import type { Train } from '@/types';

export default function TrainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  {train.number} • {formatStationLabel(train.source)} → {formatStationLabel(train.destination)}
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

          <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
            <div className="p-6">
              <JourneyTimeline train={train} />
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
