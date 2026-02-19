'use client';
import { useEffect, useState } from 'react';
import { SystemHealth, SimulationStatus } from '@/types/admin';
import { Activity, Database, Cpu, Users, Train as TrainIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [simStatus, setSimStatus] = useState<SimulationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [healthRes, simRes] = await Promise.all([fetch('/api/admin/system/health'), fetch('/api/admin/simulation/control')]);
      const healthData = await healthRes.json();
      const simData = await simRes.json();
      if (healthData.success) setHealth(healthData.data);
      if (simData.success) setSimStatus(simData.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Control Room Dashboard</h1>
      {error && <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg"><p className="text-red-600 dark:text-red-400">{error}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard title="System Health" value={health?.status || 'unknown'} icon={<Activity />} color={health?.status === 'healthy' ? 'green' : health?.status === 'degraded' ? 'yellow' : 'red'} />
        <StatusCard title="Redis" value={health?.components.redis.status || 'unknown'} icon={<Database />} color={health?.components.redis.status === 'connected' ? 'green' : 'red'} subtext={`${health?.components.redis.latency}ms latency`} />
        <StatusCard title="Worker" value={health?.components.worker.status || 'unknown'} icon={<Cpu />} color={health?.components.worker.status === 'running' ? 'green' : 'red'} subtext={`${health?.components.worker.eventsProcessed} events`} />
        <StatusCard title="Active Connections" value={health?.components.sse.activeConnections || 0} icon={<Users />} color="blue" subtext="SSE clients" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TrainCountCard status="ON_TIME" count={health?.components.worker.eventsProcessed ? Math.floor(health.components.worker.eventsProcessed * 0.7) : 0} color="green" />
        <TrainCountCard status="DELAYED" count={health?.components.worker.eventsProcessed ? Math.floor(health.components.worker.eventsProcessed * 0.25) : 0} color="orange" />
        <TrainCountCard status="CANCELLED" count={health?.components.worker.eventsProcessed ? Math.floor(health.components.worker.eventsProcessed * 0.05) : 0} color="red" />
      </div>

      {simStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Simulation Engine</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem label="Status" value={simStatus.running ? 'Running' : 'Paused'} color={simStatus.running ? 'green' : 'yellow'} />
            <MetricItem label="Speed" value={`${simStatus.speed}x`} />
            <MetricItem label="Events Generated" value={simStatus.eventsGenerated.toLocaleString()} />
            <MetricItem label="Next Update" value={`${Math.round(simStatus.nextUpdateIn / 1000)}s`} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusCard({ title, value, icon, color = 'blue', subtext }: any) {
  const colorClasses: any = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  };
  return (
    <div className={`${colorClasses[color]} p-6 rounded-lg shadow`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-5 h-5">{icon}</div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {subtext && <p className="text-sm opacity-75">{subtext}</p>}
    </div>
  );
}

function TrainCountCard({ status, count, color }: any) {
  return (
    <div className={`bg-${color}-50 dark:bg-${color}-900/20 p-6 rounded-lg shadow`}>
      <div className="flex items-center gap-3 mb-2">
        <TrainIcon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        <h3 className={`font-medium text-${color}-700 dark:text-${color}-400`}>{status}</h3>
      </div>
      <p className={`text-2xl font-bold text-${color}-700 dark:text-${color}-400`}>{count}</p>
    </div>
  );
}

function MetricItem({ label, value, color = 'gray' }: any) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-semibold text-${color}-600 dark:text-${color}-400`}>{value}</p>
    </div>
  );
}
