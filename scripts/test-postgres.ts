#!/usr/bin/env tsx
/* eslint-disable no-console */

import { prisma } from '../lib/prisma/client';
import { eventLogger } from '../lib/services/eventLogger';
import { journeyService } from '../lib/services/journeyService';
import { trainService } from '../lib/services/trainService';

async function testPostgres() {
  console.log('🐘 Testing PostgreSQL Integration...\n');

  console.log('📡 Test 1: Database Connection');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(' ✅ Connected successfully');
  } catch (error) {
    console.error(' ❌ Connection failed:', error);
    process.exit(1);
  }

  console.log('\n📡 Test 2: Journey History');
  const trains = await trainService.getAllTrains();

  if (trains.length > 0) {
    const train = trains[0];
    await journeyService.recordCompletedJourney(train);
    console.log(` ✅ Recorded journey for ${train.name}`);

    const history = await journeyService.getTrainHistory(train.id);
    console.log(` ✅ Retrieved ${history.length} history records`);

    const averageDelay = await journeyService.getAverageDelay(train.id);
    console.log(` ✅ Average delay: ${averageDelay.toFixed(1)} min`);
  } else {
    console.log(' ⚠️ No trains found in Redis. Run `npm run seed` first.');
  }

  console.log('\n📡 Test 3: System Events');
  await eventLogger.log({
    type: 'TEST_EVENT',
    level: 'INFO',
    source: 'test-script',
    message: 'Testing PostgreSQL integration',
  });
  console.log(' ✅ Event logged');

  const recentEvents = await eventLogger.getRecentEvents(5);
  console.log(` ✅ Retrieved ${recentEvents.length} recent events`);

  console.log('\n✨ All PostgreSQL tests passed!');
}

testPostgres()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
