'use client';

import { useState } from 'react';
import { useSSE } from '@/lib/hooks/useSSE';

/**
 * Test page for SSE connection
 * 
 * Visit /test-sse to see live events
 */
export default function TestSSEPage() {
  const [events, setEvents] = useState<any[]>([]);
  
  const { status, health, lastEvent } = useSSE({
    onTrainUpdate: (event) => {
      setEvents(prev => [event, ...prev].slice(0, 50));
    },
    onHeartbeat: (timestamp) => {
      console.log('Heartbeat:', new Date(timestamp).toLocaleTimeString());
    }
  });
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SSE Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Health:</strong> {health}ms</p>
        <p><strong>Events Received:</strong> {events.length}</p>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Recent Events</h2>
        {events.map((event, i) => (
          <div key={i} className="p-2 border rounded text-sm">
            <pre>{JSON.stringify(event, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}