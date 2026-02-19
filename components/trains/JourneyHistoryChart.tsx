'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface JourneyHistoryChartProps {
  trainId: string;
}

interface HistoryPoint {
  date: string;
  delay: number;
  status: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    history: Array<{
      scheduledDate: string;
      delayMinutes: number;
      status: string;
    }>;
    statistics: {
      averageDelay: number;
      onTimePerformance: number;
      totalJourneys: number;
    };
  };
}

type HistoryStats = {
  averageDelay: number;
  onTimePerformance: number;
  totalJourneys: number;
};

const COLORS: Record<string, string> = {
  ON_TIME: '#22c55e',
  DELAYED: '#f59e0b',
  CANCELLED: '#ef4444',
};

export function JourneyHistoryChart({ trainId }: JourneyHistoryChartProps) {
  const [view, setView] = useState<'line' | 'bar' | 'pie'>('line');
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trains/${trainId}/history?days=30`);
        const result = (await response.json()) as ApiResponse;

        if (!mounted || !result.success || !result.data) {
          return;
        }

        const chartData = result.data.history.map((record) => ({
          date: new Date(record.scheduledDate).toLocaleDateString(),
          delay: record.delayMinutes,
          status: record.status,
        }));

        setData(chartData);
        setStats(result.data.statistics);
      } catch (error) {
        console.error('Failed to fetch journey history:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [trainId]);

  const pieData = useMemo(() => {
    const buckets: Record<string, number> = {};

    for (const point of data) {
      buckets[point.status] = (buckets[point.status] ?? 0) + 1;
    }

    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No historical data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setView('line')}
          className={`rounded px-3 py-1 ${view === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Line
        </button>
        <button
          onClick={() => setView('bar')}
          className={`rounded px-3 py-1 ${view === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Bar
        </button>
        <button
          onClick={() => setView('pie')}
          className={`rounded px-3 py-1 ${view === 'pie' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Pie
        </button>
      </div>

      {stats && (
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="rounded bg-gray-50 p-3 text-center dark:bg-gray-800">
            <div className="text-sm text-gray-500">Avg Delay</div>
            <div className="text-xl font-bold">{stats.averageDelay.toFixed(1)} min</div>
          </div>
          <div className="rounded bg-gray-50 p-3 text-center dark:bg-gray-800">
            <div className="text-sm text-gray-500">On Time</div>
            <div className="text-xl font-bold text-green-600">
              {stats.onTimePerformance.toFixed(1)}%
            </div>
          </div>
          <div className="rounded bg-gray-50 p-3 text-center dark:bg-gray-800">
            <div className="text-sm text-gray-500">Journeys</div>
            <div className="text-xl font-bold">{stats.totalJourneys}</div>
          </div>
        </div>
      )}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Delay (min)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="delay"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Delay Minutes"
              />
            </LineChart>
          ) : view === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="delay" fill="#f59e0b" name="Delay Minutes" />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                dataKey="value"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={COLORS[entry.name] ?? '#9ca3af'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
