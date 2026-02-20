#!/usr/bin/env tsx
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
/**
 * Redis Connection Test Script
 *
 * Run with: npm run test:redis
 *
 * This script tests:
 * 1. Redis connection
 * 2. Basic operations (set/get)
 * 3. Train service operations
 */

import { resolve } from 'path';

import { config } from 'dotenv';

import { redis, testRedisConnection } from '../lib/redis/client';
import { trainService } from '../lib/services/trainService';
import type { TrainInput } from '../types';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

async function testRedis() {
  console.log('🚂 Testing Redis Connection...\n');
  // Test 1: Basic connection
  console.log('📡 Test 1: Basic Connection');
  const isConnected = await testRedisConnection();
  console.log(`${isConnected ? '✅' : '❌'} Connected: ${isConnected}`);
  if (!isConnected) {
    console.error('❌ Failed to connect to Redis. Check your REDIS_URL in .env.local');
    process.exit(1);
  }

  // Test 2: Basic operations
  console.log('\n📡 Test 2: Basic Operations');
  try {
    await redis.set('test:key', 'Hello Redis!');
    const value = await redis.get('test:key');
    console.log(` ✅ Set/Get: ${value}`);
    await redis.del('test:key');
    console.log(' ✅ Delete successful');
  } catch (error) {
    console.error(' ❌ Basic operations failed:', error);
  }

  // Test 3: Create a test train
  console.log('\n📡 Test 3: Create Test Train');
  const testTrain: TrainInput = {
    number: 'TEST01',
    name: 'Test Express',
    source: 'NDLS',
    destination: 'BCT',
    route: ['NDLS', 'CNB', 'ALD', 'BSB', 'BCT'],
    currentStationIndex: 0,
    scheduledArrival: '10:00',
    expectedArrival: '10:00',
    platform: 1,
  };

  try {
    const created = await trainService.createTrain(testTrain as any);
    console.log(` ✅ Created train: ${created.name} (${created.id})`);

    // Test 4: Retrieve the train
    console.log('\n📡 Test 4: Retrieve Train');
    const retrieved = await trainService.getTrain(created.id);
    console.log(` ✅ Retrieved: ${retrieved?.name}`);
    console.log(` Status: ${retrieved?.status}`);
    console.log(` Platform: ${retrieved?.platform}`);

    // Test 5: Update train
    console.log('\n📡 Test 5: Update Train');
    const updated = await trainService.updateTrain(created.id, {
      status: 'DELAYED',
      delayMinutes: 15,
      platform: 2,
    } as any);
    console.log(` ✅ Updated: ${updated?.status} (${updated?.delayMinutes} min delay)`);

    // Test 6: Get all trains
    console.log('\n📡 Test 6: List All Trains');
    const allTrains = await trainService.getAllTrains();
    console.log(` ✅ Found ${allTrains.length} trains`);

    // Test 7: Clean up
    console.log('\n📡 Test 7: Clean Up');
    const deleted = await trainService.deleteTrain(created.id);
    console.log(` ✅ Deleted: ${deleted}`);
  } catch (error) {
    console.error(' ❌ Train operations failed:', error);
  }

  console.log('\n✨ All tests completed!');
  process.exit(0);
}

// Run tests
testRedis().catch((e) => {
  console.error(e);
  process.exit(1);
});
