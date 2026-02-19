'use client';
import { useEffect, useState } from 'react';
import { SimulationStatus } from '@/types/admin';
import { DEFAULT_PROBABILITIES } from '@/worker/config/probabilities';
import { Play, Pause, RefreshCw, Sliders, Zap } from 'lucide-react';

export default function SimulationControlPage() {
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [probabilities, setProbabilities] = useState(DEFAULT_PROBABILITIES);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/simulation/control');
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
        setSpeed(data.data.speed);
        setProbabilities(data.data.probabilities);
      }
    } catch (error) {
      console.error('Failed to fetch simulation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = async (command: any) => {
    try {
      const res = await fetch('/api/admin/simulation/control', { method: 'POST', body: JSON.stringify(command) });
      if (res.ok) fetchStatus();
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Simulation Control</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Master Control</h2>
        <div className="flex gap-4 mb-6">
          {status?.running ? (
            <button onClick={() => sendCommand({ type: 'PAUSE' })} className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"><Pause className="w-5 h-5" /> Pause Simulation</button>
          ) : (
            <button onClick={() => sendCommand({ type: 'RESUME' })} className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"><Play className="w-5 h-5" /> Resume Simulation</button>
          )}
          <button onClick={() => sendCommand({ type: 'RESET_SIMULATION' })} className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"><RefreshCw className="w-5 h-5" /> Reset All Trains</button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Simulation Speed: {speed}x</label>
          <div className="flex gap-2">
            {[1, 2, 5, 10].map((s) => (
              <button key={s} onClick={() => { setSpeed(s); sendCommand({ type: 'SET_SPEED', speed: s }); }} className={`px-4 py-2 rounded-lg transition-colors ${speed === s ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{s}x</button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">Real-time: {8 / speed} seconds between updates</p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`text-lg font-semibold ${status?.running ? 'text-green-600' : 'text-yellow-600'}`}>{status?.running ? 'Running' : 'Paused'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Events Generated</p>
            <p className="text-lg font-semibold">{status?.eventsGenerated}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Update</p>
            <p className="text-lg font-semibold">{status?.lastUpdate ? new Date(status.lastUpdate).toLocaleTimeString() : 'Never'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Update In</p>
            <p className="text-lg font-semibold">{Math.round((status?.nextUpdateIn || 0) / 1000)}s</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Sliders className="w-5 h-5" /> Event Probabilities</h2>
        <div className="space-y-4">
          <ProbabilitySlider label="Delay Probability" value={probabilities.delay} onChange={(value: number) => setProbabilities({ ...probabilities, delay: value })} />
          <ProbabilitySlider label="Recovery Probability" value={probabilities.recovery} onChange={(value: number) => setProbabilities({ ...probabilities, recovery: value })} />
          <ProbabilitySlider label="Platform Change Probability" value={probabilities.platformChange} onChange={(value: number) => setProbabilities({ ...probabilities, platformChange: value })} />
          <ProbabilitySlider label="Cancellation Probability" value={probabilities.cancellation} onChange={(value: number) => setProbabilities({ ...probabilities, cancellation: value })} />
          <button onClick={() => sendCommand({ type: 'SET_PROBABILITIES', probabilities })} className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">Update Probabilities</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> Manual Event Triggers</h2>
        <p className="text-sm text-gray-500 mb-4">Trigger events manually on specific trains (use with caution)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ManualTriggerCard title="Force Delay" description="Add 15 minutes delay" color="orange" onClick={() => { const trainId = prompt('Enter Train ID:'); if (trainId) sendCommand({ type: 'TRIGGER_EVENT', event: { type: 'DELAY', trainId, params: { minutes: 15 } } }); }} />
          <ManualTriggerCard title="Change Platform" description="Switch to different platform" color="blue" onClick={() => { const trainId = prompt('Enter Train ID:'); if (trainId) sendCommand({ type: 'TRIGGER_EVENT', event: { type: 'PLATFORM_CHANGE', trainId } }); }} />
          <ManualTriggerCard title="Cancel Train" description="Cancel this train" color="red" onClick={() => { const trainId = prompt('Enter Train ID:'); if (trainId) sendCommand({ type: 'TRIGGER_EVENT', event: { type: 'CANCELLATION', trainId } }); }} />
        </div>
      </div>
    </div>
  );
}

function ProbabilitySlider({ label, value, onChange }: any) {
  return (
    <div>
      <div className="flex justify-between mb-1"><label className="text-sm font-medium">{label}</label><span className="text-sm text-gray-500">{Math.round(value * 100)}%</span></div>
      <input type="range" min="0" max="1" step="0.01" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full" />
    </div>
  );
}

function ManualTriggerCard({ title, description, color, onClick }: any) {
  const colorClasses: any = {
    orange: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30',
    blue: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    red: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
  };
  return (
    <button onClick={onClick} className={`p-4 rounded-lg text-left transition-colors ${colorClasses[color]}`}>
      <h3 className={`font-semibold text-${color}-700 dark:text-${color}-400`}>{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
    </button>
  );
}
