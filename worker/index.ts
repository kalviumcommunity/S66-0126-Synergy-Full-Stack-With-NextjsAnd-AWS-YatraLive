#!/usr/bin/env tsx

/**
 * Train Tracker Background Worker
 *
 * This worker runs continuously, updating train statuses
 * to simulate a real-time railway system.
 *
 * Run with: npm run worker
 *
 * ANALOGY: The automatic train control system that runs
 * 24/7 in the background, making trains move and change.
 */
import { redis, testRedisConnection } from '@/lib/redis/client';
import { eventLogger } from '@/lib/services/eventLogger';
import { journeyService } from '@/lib/services/journeyService';
import { trainService } from '@/lib/services/trainService';
import { env } from '@/lib/utils/env';

import {
  WORKER_NAME,
  WORKER_KEYS,
  DEFAULT_UPDATE_INTERVAL,
  HEARTBEAT_INTERVAL,
} from './config/constants';
import { checkAndSendDelayAlerts, checkAndSendPlatformChangeAlerts } from './hooks/emailHooks';
import { simulationEngine } from './simulationEngine';
import { logger } from './utils/logger';
class TrainWorker {
  private intervalMs: number;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private shouldStop = false;
  private cycleCount = 0;
  constructor() {
    this.intervalMs = (env.simulation.workerInterval || DEFAULT_UPDATE_INTERVAL) * 1000;
  }
  /**
   * Start the worker
   */
  async start() {
    logger.info(`🚂 Train Worker starting (PID: ${process.pid})`);
    logger.info(`Worker name: ${WORKER_NAME}`);
    logger.info(`Update interval: ${this.intervalMs}ms`);
    // Check Redis connection
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      logger.error('Cannot connect to Redis. Exiting.');
      process.exit(1);
    }
    logger.info('✅ Redis connection established');
    this.isRunning = true;
    this.shouldStop = false;
    // Register worker in Redis
    await this.registerWorker();
    // Start heartbeat
    this.startHeartbeat();
    // Start main loop
    this.runLoop();
    // Handle shutdown signals
    this.setupSignalHandlers();
  }
  /**
   * Stop the worker gracefully
   */
  async stop() {
    logger.info('🛑 Stopping worker gracefully...');
    this.shouldStop = true;
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    // Update worker status
    await redis.hset(WORKER_KEYS.STATUS, {
      status: 'stopped',
      stoppedAt: Date.now(),
    });
    logger.info('Worker stopped');
    process.exit(0);
  }
  /**
   * Main worker loop
   */
  private async runLoop() {
    while (!this.shouldStop) {
      try {
        const startTime = Date.now();
        // Check if worker is paused via admin control
        const shouldPause = await this.isPaused();
        if (shouldPause) {
          logger.info('Worker paused. Waiting...');
          await this.sleep(5000);
          continue;
        }
        // Run one simulation cycle
        const result = await simulationEngine.runCycle();
        await this.recordCompletedJourneys(result.updatedTrainIds);

        // Send email notifications for delays and platform changes
        const updatedTrains = await trainService.getAllTrains();
        const relevantTrains = updatedTrains.filter((t) => result.updatedTrainIds.includes(t.id));
        await checkAndSendDelayAlerts(relevantTrains);
        await checkAndSendPlatformChangeAlerts(relevantTrains);

        await eventLogger.log({
          type: 'WORKER_CYCLE',
          level: 'INFO',
          source: 'worker',
          message: `Completed cycle with ${result.events.length} events`,
          details: {
            duration: Date.now() - startTime,
            trainsUpdated: result.updatedTrains,
            events: result.events.length,
          },
        });
        this.cycleCount++;

        // Update stats in Redis
        await this.updateStats(result, Date.now() - startTime);
        // Log summary
        logger.info(
          `Cycle ${this.cycleCount} complete: ${result.events.length} events in ${Date.now() - startTime}ms`
        );
        // Calculate next run time (respect interval)
        const elapsed = Date.now() - startTime;
        const waitTime = Math.max(0, this.intervalMs - elapsed);
        if (waitTime > 0) {
          await this.sleep(waitTime);
        }
      } catch (error) {
        logger.error('Error in worker loop:', error);
        await eventLogger.log({
          type: 'WORKER_ERROR',
          level: 'ERROR',
          source: 'worker',
          message: error instanceof Error ? error.message : 'Unknown worker error',
          details: { error: String(error) },
        });
        // Wait a bit before retrying after error
        await this.sleep(5000);
      }
    }
  }
  /**
   * Register worker in Redis
   */
  private async registerWorker() {
    await redis.hset(WORKER_KEYS.STATUS, {
      pid: process.pid,
      name: WORKER_NAME,
      status: 'running',
      startedAt: Date.now(),
      interval: this.intervalMs,
    });
  }
  /**
   * Start heartbeat
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await redis.set(WORKER_KEYS.HEARTBEAT, Date.now());
        logger.debug('Heartbeat sent');
      } catch (error) {
        logger.error('Failed to send heartbeat:', error);
      }
    }, HEARTBEAT_INTERVAL * 1000);
  }
  /**
   * Update worker statistics
   */
  private async updateStats(
    result: { updatedTrains: number; events: unknown[] },
    duration: number
  ) {
    const pipeline = redis.pipeline();
    pipeline.hincrby(WORKER_KEYS.STATUS, 'totalCycles', 1);
    pipeline.hincrby(WORKER_KEYS.STATUS, 'totalEvents', result.events.length);
    pipeline.hset(WORKER_KEYS.LAST_RUN, {
      timestamp: Date.now(),
      duration,
      events: result.events.length,
      trainsUpdated: result.updatedTrains,
    });
    await pipeline.exec();
  }

  /**
   * Record completed journeys to historical storage
   */
  private async recordCompletedJourneys(updatedTrainIds: string[]): Promise<void> {
    for (const trainId of updatedTrainIds) {
      const train = await trainService.getTrain(trainId);
      if (!train) {
        continue;
      }

      const isAtDestination = train.currentStationIndex === train.route.length - 1;
      if (isAtDestination) {
        await journeyService.recordCompletedJourney(train);
      }
    }
  }
  /**
   * Check if worker is paused via admin control
   */
  private async isPaused(): Promise<boolean> {
    try {
      const control = await redis.get(WORKER_KEYS.CONTROL);
      return control === 'PAUSED';
    } catch {
      return false;
    }
  }
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupSignalHandlers() {
    process.on('SIGTERM', () => this.stop());
    process.on('SIGINT', () => this.stop());
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      this.stop();
    });
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled rejection:', error);
    });
  }
}
// Create and start worker
const worker = new TrainWorker();
// Check if this file is being run directly
if (require.main === module) {
  worker.start().catch((error) => {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  });
}
export { TrainWorker };
