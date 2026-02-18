import { NextRequest } from 'next/server';
import { redis } from '@/lib/redis/client';
import { formatSSEMessage, SSEMessage } from '@/types/events/sse';
import { TrainEvent } from '@/types';
import { v7 as uuidv7 } from 'uuid';

/**
 * SSE Connection Manager
 * 
 * This endpoint handles Server-Sent Events connections.
 * Each connected client gets a persistent connection that
 * receives real-time train updates.
 * 
 * ANALOGY: Like plugging into the railway's PA system -
 * every announcement is broadcast to all connected listeners.
 */

// Store active connections for monitoring (optional)
const activeConnections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // Create a stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Register this connection
      activeConnections.add(controller);
      
      // Send initial connection message
      const connectionMessage: SSEMessage = {
        event: 'connection-established',
        data: {
          message: 'Connected to train tracker live stream',
          timestamp: Date.now(),
          clientId: uuidv7()
        },
        id: uuidv7()
      };
      
      controller.enqueue(
        new TextEncoder().encode(formatSSEMessage(connectionMessage))
      );
      
      // Subscribe to Redis Pub/Sub for train updates
      const subscriber = redis.duplicate(); // Create a new connection for Pub/Sub
      
      subscriber.subscribe('train-updates', (err, count) => {
        if (err) {
          console.error('Failed to subscribe:', err);
          return;
        }
        console.log(`Subscribed to train-updates. Client count: ${count}`);
      });
      
      // Handle incoming messages from Redis
      subscriber.on('message', (channel, message) => {
        if (channel === 'train-updates') {
          try {
            const event = JSON.parse(message) as TrainEvent;
            
            // Format as SSE message
            const sseMessage: SSEMessage = {
              event: 'train-update',
              data: event,
              id: event.id
            };
            
            // Send to client
            controller.enqueue(
              new TextEncoder().encode(formatSSEMessage(sseMessage))
            );
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      });
      
      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeatMessage: SSEMessage = {
            event: 'heartbeat',
            data: { timestamp: Date.now() }
          };
          
          controller.enqueue(
            new TextEncoder().encode(formatSSEMessage(heartbeatMessage))
          );
        } catch (error) {
          // Client probably disconnected
          clearInterval(heartbeatInterval);
        }
      }, 30000);
      
      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        subscriber.unsubscribe();
        subscriber.quit();
        activeConnections.delete(controller);
        console.log('Client disconnected');
      });
    }
  });
  
  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable nginx buffering
    }
  });
}

/**
 * Optional: Get active connection count
 * Useful for monitoring and debugging
 */
export async function getActiveConnectionCount(): Promise<number> {
  return activeConnections.size;
}