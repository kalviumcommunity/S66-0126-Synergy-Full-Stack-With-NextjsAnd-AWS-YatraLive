#!/usr/bin/env tsx
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
/**
 * Database Seeding Script
 *
 * Run with: npm run seed
 *
 * This script populates Redis with initial train and station data
 */

import { resolve } from 'path';

import { config } from 'dotenv';

import { redis } from '../lib/redis/client';
import { trainService } from '../lib/services/trainService';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

// Realistic Indian trains (simplified)
const INITIAL_TRAINS = [
  {
    number: '12301',
    name: 'Howrah Rajdhani Express',
    source: 'HWH',
    destination: 'NDLS',
    route: ['HWH', 'DGR', 'GAYA', 'MGS', 'CNB', 'NDLS'],
    scheduledArrival: '10:00',
    platform: 1,
  },
  {
    number: '12951',
    name: 'Mumbai Rajdhani Express',
    source: 'MMCT',
    destination: 'NDLS',
    route: ['MMCT', 'BRC', 'KOTA', 'NZM', 'NDLS'],
    scheduledArrival: '08:35',
    platform: 2,
  },
  {
    number: '12273',
    name: 'Howrah Duronto Express',
    source: 'HWH',
    destination: 'NDLS',
    route: ['HWH', 'ASN', 'MGS', 'CNB', 'NDLS'],
    scheduledArrival: '14:20',
    platform: 3,
  },
  {
    number: '12801',
    name: 'Purushottam Express',
    source: 'PURI',
    destination: 'NDLS',
    route: ['PURI', 'BBS', 'KUR', 'BLS', 'HWH', 'DGR', 'ASN', 'GAYA', 'MGS', 'ALD', 'CNB', 'NDLS'],
    scheduledArrival: '21:45',
    platform: 4,
  },
  {
    number: '12627',
    name: 'Karnataka Express',
    source: 'SBC',
    destination: 'NDLS',
    route: ['SBC', 'KJM', 'KPD', 'MAS', 'GTL', 'LPI', 'BPQ', 'NGP', 'BPL', 'JHS', 'NDLS'],
    scheduledArrival: '18:30',
    platform: 5,
  },
];

const STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi', platformCount: 16 },
  { code: 'HWH', name: 'Howrah', city: 'Kolkata', state: 'West Bengal', platformCount: 23 },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', platformCount: 9 },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka', platformCount: 10 },
  {
    code: 'CNB',
    name: 'Kanpur Central',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    platformCount: 10,
  },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', platformCount: 8 },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', platformCount: 15 },
  { code: 'PURI', name: 'Puri', city: 'Puri', state: 'Odisha', platformCount: 6 },
  { code: 'GAYA', name: 'Gaya', city: 'Gaya', state: 'Bihar', platformCount: 5 },
  { code: 'ALD', name: 'Prayagraj', city: 'Prayagraj', state: 'Uttar Pradesh', platformCount: 8 },
];

async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...\n');
  console.log('🧹 Clearing existing data...');
  await redis.flushdb();
  console.log('✅ Database cleared\n');

  console.log('🚉 Seeding stations...');
  for (const station of STATIONS) {
    await redis.hset(`station:${station.code}`, {
      ...station,
      trains: JSON.stringify([]),
    } as any);
    console.log(` ✅ Created station: ${station.name} (${station.code})`);
  }

  console.log('\n🚂 Seeding trains...');
  const createdTrains: any[] = [];
  for (const trainData of INITIAL_TRAINS) {
    const train = await trainService.createTrain({
      ...trainData,
      currentStationIndex: 0,
      expectedArrival: trainData.scheduledArrival,
      status: Math.random() > 0.7 ? 'DELAYED' : 'ON_TIME',
      delayMinutes: Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0,
    } as any);
    createdTrains.push(train);
    console.log(` ✅ Created train: ${train.name} (${train.number}) - ${train.status}`);

    // Update station train lists
    for (const stationCode of train.route) {
      const key = `station:${stationCode}`;
      const existing = await redis.hgetall(key);
      const existingTrains = existing.trains ? JSON.parse(existing.trains) : [];
      await redis.hset(key, 'trains', JSON.stringify([...existingTrains, train.number]));
    }
  }

  console.log('\n✨ Seeding complete!');
  console.log(` 📊 Created ${STATIONS.length} stations`);
  console.log(` 🚂 Created ${createdTrains.length} trains`);

  const counts = await trainService.countTrainsByStatus();
  console.log('\n📈 Train status summary:');
  console.log(` ✅ On Time: ${counts.ON_TIME}`);
  console.log(` ⚠️ Delayed: ${counts.DELAYED}`);
  console.log(` ❌ Cancelled: ${counts.CANCELLED}`);
  process.exit(0);
}

seedDatabase().catch((e) => {
  console.error(e);
  process.exit(1);
});
