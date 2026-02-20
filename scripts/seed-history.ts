#!/usr/bin/env tsx
/* eslint-disable no-console */

// Load environment variables
import { resolve } from 'path';

import { config } from 'dotenv';
config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../lib/prisma/client';
import { trainService } from '../lib/services/trainService';

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

async function seedHistory() {
  console.log('📊 Seeding historical journey data...');

  const trains = await trainService.getAllTrains();

  for (const train of trains) {
    console.log(`\n🚂 Generating history for ${train.name}...`);

    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const random = Math.random();
      let delayMinutes = 0;
      let status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' = 'ON_TIME';

      if (random < 0.6) {
        delayMinutes = 0;
        status = 'ON_TIME';
      } else if (random < 0.85) {
        delayMinutes = Math.floor(Math.random() * 25) + 5;
        status = 'DELAYED';
      } else if (random < 0.95) {
        delayMinutes = Math.floor(Math.random() * 40) + 30;
        status = 'DELAYED';
      } else {
        delayMinutes = 0;
        status = 'CANCELLED';
      }

      if (i % 7 === 0) {
        delayMinutes = Math.min(delayMinutes + 5, 60);
      }

      if (train.number === '12301' && i % 3 === 0) {
        delayMinutes = Math.min(delayMinutes + 10, 45);
      }

      await prisma.journeyHistory.create({
        data: {
          trainId: train.id,
          trainNumber: train.number,
          trainName: train.name,
          source: train.source,
          destination: train.destination,
          route: train.route,
          scheduledDate: date,
          scheduledTime: train.scheduledArrival,
          actualTime:
            delayMinutes > 0
              ? addMinutes(train.scheduledArrival, delayMinutes)
              : train.scheduledArrival,
          delayMinutes,
          status,
          completedStations: train.route,
          finalStationIndex: train.route.length - 1,
        },
      });
    }

    console.log(' ✅ Added 90 days of history');
  }

  console.log('\n✨ Historical data seeding complete!');
}

seedHistory()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
