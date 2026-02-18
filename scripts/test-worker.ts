#!/usr/bin/env tsx
/**
* Worker Test Script
*
* Run with: npm run test:worker
*
* This script tests the worker functionality
*/
import { redis, testRedisConnection } from '../lib/redis/client';
import { simulationEngine } from '../worker/simulationEngine';
import { eventPublisher } from '../worker/utils/eventPublisher';
import { trainService } from '../lib/services/trainService';
import { logger } from '../worker/utils/logger';
async function testWorker() {
    console.log('🧪 Testing Worker System...\n');
    // Test 1: Redis connection
    console.log('📡 Test 1: Redis Connection');
    const connected = await testRedisConnection();
    console.log(`${connected ? '✅' : '❌'} Connected: ${connected}`);
    if (!connected) {
        process.exit(1);
    }
    // Test 2: Get train count
    console.log('\n📡 Test 2: Check Trains');
    const trains = await trainService.getAllTrains();
    console.log(` Found ${trains.length} trains in database`);
    if (trains.length === 0) {
        console.log(' ⚠️ No trains found. Run seed first: npm run seed');
        process.exit(1);
    }
    // Test 3: Run single simulation cycle
    console.log('\n📡 Test 3: Run Simulation Cycle');
    const result = await simulationEngine.runCycle();
    console.log(` Updated ${result.updatedTrains} trains`);
    console.log(` Generated ${result.events.length} events`);
    // Test 4: Check events
    console.log('\n📡 Test 4: Verify Events');
    if (result.events.length > 0) {
        const event = result.events[0];
        console.log(` Sample event: ${event.type} for train ${event.trainId}`);
        // Check if event was published to Redis
        const trainEvents = await eventPublisher.getTrainEvents(event.trainId, 1);
        console.log(` Event stored in Redis: ${trainEvents.length > 0 ? '✅' : '❌'}`);
    }
    // Test 5: Worker stats
    console.log('\n📡 Test 5: Worker Stats');
    const stats = simulationEngine.getStats();
    console.log(` Total updates: ${stats.totalUpdates}`);
    console.log(` Probabilities:`, stats.probabilities);
    console.log('\n✨ Worker tests completed!');
    process.exit(0);
}
testWorker().catch(console.error);
