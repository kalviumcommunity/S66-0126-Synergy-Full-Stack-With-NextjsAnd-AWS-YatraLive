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

const INITIAL_TRAINS = [
  { number: '12301', name: 'Howrah Rajdhani Express', source: 'HWH', destination: 'NDLS', route: ['HWH', 'DGR', 'GAYA', 'MGS', 'CNB', 'NDLS'], scheduledArrival: '10:00', platform: 1 },
  { number: '12951', name: 'Mumbai Rajdhani Express', source: 'MMCT', destination: 'NDLS', route: ['MMCT', 'BRC', 'KOTA', 'NZM', 'NDLS'], scheduledArrival: '08:35', platform: 2 },
  { number: '12273', name: 'Howrah Duronto Express', source: 'HWH', destination: 'NDLS', route: ['HWH', 'ASN', 'GAYA', 'CNB', 'NDLS'], scheduledArrival: '14:20', platform: 3 },
  { number: '12801', name: 'Purushottam Express', source: 'PURI', destination: 'NDLS', route: ['PURI', 'BBS', 'KUR', 'BLS', 'HWH', 'DGR', 'ASN', 'GAYA', 'MGS', 'ALD', 'CNB', 'NDLS'], scheduledArrival: '21:45', platform: 4 },
  { number: '12627', name: 'Karnataka Express', source: 'SBC', destination: 'NDLS', route: ['SBC', 'KJM', 'KPD', 'MAS', 'GTL', 'LPI', 'BPQ', 'NGP', 'BPL', 'JHS', 'NDLS'], scheduledArrival: '18:30', platform: 5 },
  { number: '12433', name: 'Chennai Rajdhani Express', source: 'MAS', destination: 'NZM', route: ['MAS', 'NLR', 'BZA', 'BPQ', 'NGP', 'BPL', 'NZM'], scheduledArrival: '06:15', platform: 6 },
  { number: '12001', name: 'Bhopal Shatabdi Express', source: 'NDLS', destination: 'BPL', route: ['NDLS', 'MTJ', 'AGC', 'GWL', 'JHS', 'BPL'], scheduledArrival: '20:10', platform: 7 },
  { number: '12002', name: 'Habibganj Shatabdi Express', source: 'BPL', destination: 'NDLS', route: ['BPL', 'JHS', 'GWL', 'AGC', 'MTJ', 'NDLS'], scheduledArrival: '22:05', platform: 8 },
  { number: '12019', name: 'Dehradun Shatabdi Express', source: 'NDLS', destination: 'DDN', route: ['NDLS', 'GZB', 'MTC', 'SRE', 'RK', 'DDN'], scheduledArrival: '13:35', platform: 9 },
  { number: '12020', name: 'Dehradun Shatabdi Return', source: 'DDN', destination: 'NDLS', route: ['DDN', 'RK', 'SRE', 'MTC', 'GZB', 'NDLS'], scheduledArrival: '21:50', platform: 10 },
  { number: '12621', name: 'Tamil Nadu Express', source: 'MAS', destination: 'NDLS', route: ['MAS', 'BZA', 'BPQ', 'NGP', 'BPL', 'JHS', 'NDLS'], scheduledArrival: '16:40', platform: 11 },
  { number: '12622', name: 'Tamil Nadu Express Return', source: 'NDLS', destination: 'MAS', route: ['NDLS', 'JHS', 'BPL', 'NGP', 'BPQ', 'BZA', 'MAS'], scheduledArrival: '17:05', platform: 12 },
  { number: '12723', name: 'Telangana Express', source: 'HYB', destination: 'NDLS', route: ['HYB', 'SC', 'BPQ', 'NGP', 'BPL', 'JHS', 'NDLS'], scheduledArrival: '12:45', platform: 13 },
  { number: '12724', name: 'Telangana Express Return', source: 'NDLS', destination: 'HYB', route: ['NDLS', 'JHS', 'BPL', 'NGP', 'BPQ', 'SC', 'HYB'], scheduledArrival: '09:10', platform: 14 },
  { number: '12839', name: 'Howrah Chennai Mail', source: 'HWH', destination: 'MAS', route: ['HWH', 'KGP', 'BLS', 'BBS', 'VSKP', 'RJM', 'BZA', 'MAS'], scheduledArrival: '19:15', platform: 1 },
  { number: '12840', name: 'Chennai Howrah Mail', source: 'MAS', destination: 'HWH', route: ['MAS', 'BZA', 'RJM', 'VSKP', 'BBS', 'BLS', 'KGP', 'HWH'], scheduledArrival: '20:25', platform: 2 },
  { number: '12245', name: 'Duronto Yeshwantpur Express', source: 'HWH', destination: 'YPR', route: ['HWH', 'KGP', 'ROU', 'RNC', 'BSP', 'RYP', 'YPR'], scheduledArrival: '07:45', platform: 3 },
  { number: '12246', name: 'Duronto Howrah Express', source: 'YPR', destination: 'HWH', route: ['YPR', 'RYP', 'BSP', 'RNC', 'ROU', 'KGP', 'HWH'], scheduledArrival: '08:10', platform: 4 },
  { number: '12137', name: 'Punjab Mail', source: 'CSMT', destination: 'FZR', route: ['CSMT', 'KYN', 'NGP', 'BPL', 'NZM', 'LDH', 'JUC', 'FZR'], scheduledArrival: '15:30', platform: 5 },
  { number: '12138', name: 'Punjab Mail Return', source: 'FZR', destination: 'CSMT', route: ['FZR', 'JUC', 'LDH', 'NZM', 'BPL', 'NGP', 'KYN', 'CSMT'], scheduledArrival: '11:35', platform: 6 },
  { number: '12123', name: 'Deccan Queen', source: 'CSMT', destination: 'PUNE', route: ['CSMT', 'KYN', 'LNL', 'PUNE'], scheduledArrival: '09:45', platform: 7 },
  { number: '12124', name: 'Deccan Queen Return', source: 'PUNE', destination: 'CSMT', route: ['PUNE', 'LNL', 'KYN', 'CSMT'], scheduledArrival: '18:00', platform: 8 },
  { number: '12701', name: 'Hussainsagar Express', source: 'CSMT', destination: 'HYB', route: ['CSMT', 'PUNE', 'SUR', 'WADI', 'SC', 'HYB'], scheduledArrival: '05:35', platform: 9 },
  { number: '12702', name: 'Hussainsagar Return', source: 'HYB', destination: 'CSMT', route: ['HYB', 'SC', 'WADI', 'SUR', 'PUNE', 'CSMT'], scheduledArrival: '23:10', platform: 10 },
  { number: '12809', name: 'Mumbai Howrah Mail', source: 'CSMT', destination: 'HWH', route: ['CSMT', 'NGP', 'RYP', 'BSP', 'RNC', 'KGP', 'HWH'], scheduledArrival: '04:20', platform: 11 },
  { number: '12810', name: 'Howrah Mumbai Mail', source: 'HWH', destination: 'CSMT', route: ['HWH', 'KGP', 'RNC', 'BSP', 'RYP', 'NGP', 'CSMT'], scheduledArrival: '05:10', platform: 12 },
  { number: '22691', name: 'Bengaluru Rajdhani Express', source: 'SBC', destination: 'NZM', route: ['SBC', 'DMM', 'GTL', 'SC', 'BPQ', 'NGP', 'BPL', 'NZM'], scheduledArrival: '11:55', platform: 13 },
  { number: '22692', name: 'Rajdhani Bengaluru Return', source: 'NZM', destination: 'SBC', route: ['NZM', 'BPL', 'NGP', 'BPQ', 'SC', 'GTL', 'DMM', 'SBC'], scheduledArrival: '12:25', platform: 14 },
  { number: '12295', name: 'Sanghamitra Express', source: 'SBC', destination: 'DNR', route: ['SBC', 'KJM', 'GTL', 'SC', 'BPQ', 'NGP', 'JBP', 'PRYJ', 'DDU', 'DNR'], scheduledArrival: '03:40', platform: 15 },
  { number: '12296', name: 'Sanghamitra Return', source: 'DNR', destination: 'SBC', route: ['DNR', 'DDU', 'PRYJ', 'JBP', 'NGP', 'BPQ', 'SC', 'GTL', 'KJM', 'SBC'], scheduledArrival: '02:50', platform: 16 },
  { number: '12313', name: 'Sealdah Rajdhani Express', source: 'SDAH', destination: 'NDLS', route: ['SDAH', 'BWN', 'DGR', 'GAYA', 'DDU', 'CNB', 'NDLS'], scheduledArrival: '07:20', platform: 3 },
  { number: '12314', name: 'Sealdah Rajdhani Return', source: 'NDLS', destination: 'SDAH', route: ['NDLS', 'CNB', 'DDU', 'GAYA', 'DGR', 'BWN', 'SDAH'], scheduledArrival: '08:05', platform: 4 },
  { number: '12623', name: 'Trivandrum Mail', source: 'MAS', destination: 'TVC', route: ['MAS', 'KPD', 'SA', 'ED', 'CBE', 'ERS', 'TVC'], scheduledArrival: '06:40', platform: 5 },
  { number: '12624', name: 'Trivandrum Mail Return', source: 'TVC', destination: 'MAS', route: ['TVC', 'ERS', 'CBE', 'ED', 'SA', 'KPD', 'MAS'], scheduledArrival: '07:10', platform: 6 },
  { number: '12679', name: 'Jaipur Mysuru Express', source: 'YPR', destination: 'JP', route: ['YPR', 'SBC', 'DMM', 'GTL', 'SC', 'BPQ', 'NGP', 'KOTA', 'JP'], scheduledArrival: '15:20', platform: 7 },
  { number: '12680', name: 'Mysuru Jaipur Express Return', source: 'JP', destination: 'YPR', route: ['JP', 'KOTA', 'NGP', 'BPQ', 'SC', 'GTL', 'DMM', 'SBC', 'YPR'], scheduledArrival: '16:05', platform: 8 },
  { number: '12925', name: 'Paschim SF Express', source: 'BDTS', destination: 'ASR', route: ['BDTS', 'VAPI', 'ST', 'BRC', 'KOTA', 'NZM', 'LDH', 'ASR'], scheduledArrival: '13:40', platform: 9 },
  { number: '12926', name: 'Paschim SF Express Return', source: 'ASR', destination: 'BDTS', route: ['ASR', 'LDH', 'NZM', 'KOTA', 'BRC', 'ST', 'VAPI', 'BDTS'], scheduledArrival: '14:10', platform: 10 },
  { number: '12915', name: 'Ashram Express', source: 'NDLS', destination: 'ADI', route: ['NDLS', 'JP', 'AII', 'ABR', 'ADI'], scheduledArrival: '11:15', platform: 11 },
  { number: '12916', name: 'Ashram Express Return', source: 'ADI', destination: 'NDLS', route: ['ADI', 'ABR', 'AII', 'JP', 'NDLS'], scheduledArrival: '12:05', platform: 12 },
];

const STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi', platformCount: 16 },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi', platformCount: 7 },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', platformCount: 23 },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal', platformCount: 21 },
  { code: 'BWN', name: 'Barddhaman', city: 'Barddhaman', state: 'West Bengal', platformCount: 8 },
  { code: 'DGR', name: 'Durgapur', city: 'Durgapur', state: 'West Bengal', platformCount: 5 },
  { code: 'ASN', name: 'Asansol Junction', city: 'Asansol', state: 'West Bengal', platformCount: 10 },
  { code: 'KGP', name: 'Kharagpur Junction', city: 'Kharagpur', state: 'West Bengal', platformCount: 12 },
  { code: 'BLS', name: 'Balasore', city: 'Balasore', state: 'Odisha', platformCount: 4 },
  { code: 'PURI', name: 'Puri', city: 'Puri', state: 'Odisha', platformCount: 6 },
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', platformCount: 6 },
  { code: 'KUR', name: 'Khurda Road', city: 'Khurda', state: 'Odisha', platformCount: 7 },
  { code: 'GAYA', name: 'Gaya Junction', city: 'Gaya', state: 'Bihar', platformCount: 5 },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', city: 'Mughalsarai', state: 'Uttar Pradesh', platformCount: 8 },
  { code: 'MGS', name: 'Mughalsarai', city: 'Mughalsarai', state: 'Uttar Pradesh', platformCount: 8 },
  { code: 'ALD', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh', platformCount: 8 },
  { code: 'PRYJ', name: 'Prayagraj Chheoki', city: 'Prayagraj', state: 'Uttar Pradesh', platformCount: 4 },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', platformCount: 10 },
  { code: 'JHS', name: 'Jhansi Junction', city: 'Jhansi', state: 'Uttar Pradesh', platformCount: 8 },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', platformCount: 6 },
  { code: 'MTJ', name: 'Mathura Junction', city: 'Mathura', state: 'Uttar Pradesh', platformCount: 10 },
  { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior', state: 'Madhya Pradesh', platformCount: 4 },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', platformCount: 6 },
  { code: 'JBP', name: 'Jabalpur', city: 'Jabalpur', state: 'Madhya Pradesh', platformCount: 6 },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', platformCount: 9 },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', platformCount: 18 },
  { code: 'KYN', name: 'Kalyan Junction', city: 'Kalyan', state: 'Maharashtra', platformCount: 8 },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', platformCount: 6 },
  { code: 'LNL', name: 'Lonavala', city: 'Lonavala', state: 'Maharashtra', platformCount: 3 },
  { code: 'SUR', name: 'Solapur', city: 'Solapur', state: 'Maharashtra', platformCount: 5 },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat', platformCount: 7 },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan', platformCount: 6 },
  { code: 'FZR', name: 'Firozpur Cantt', city: 'Firozpur', state: 'Punjab', platformCount: 4 },
  { code: 'LDH', name: 'Ludhiana Junction', city: 'Ludhiana', state: 'Punjab', platformCount: 7 },
  { code: 'JUC', name: 'Jalandhar City', city: 'Jalandhar', state: 'Punjab', platformCount: 5 },
  { code: 'DDN', name: 'Dehradun', city: 'Dehradun', state: 'Uttarakhand', platformCount: 5 },
  { code: 'RK', name: 'Roorkee', city: 'Roorkee', state: 'Uttarakhand', platformCount: 3 },
  { code: 'SRE', name: 'Saharanpur Junction', city: 'Saharanpur', state: 'Uttar Pradesh', platformCount: 6 },
  { code: 'MTC', name: 'Meerut City', city: 'Meerut', state: 'Uttar Pradesh', platformCount: 5 },
  { code: 'GZB', name: 'Ghaziabad Junction', city: 'Ghaziabad', state: 'Uttar Pradesh', platformCount: 6 },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', platformCount: 15 },
  { code: 'NLR', name: 'Nellore', city: 'Nellore', state: 'Andhra Pradesh', platformCount: 4 },
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh', platformCount: 10 },
  { code: 'VSKP', name: 'Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh', platformCount: 8 },
  { code: 'RJM', name: 'Rajahmundry', city: 'Rajahmundry', state: 'Andhra Pradesh', platformCount: 4 },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka', platformCount: 10 },
  { code: 'YPR', name: 'Yesvantpur Junction', city: 'Bengaluru', state: 'Karnataka', platformCount: 6 },
  { code: 'KJM', name: 'Krishnarajapuram', city: 'Bengaluru', state: 'Karnataka', platformCount: 4 },
  { code: 'DMM', name: 'Dharmavaram Junction', city: 'Dharmavaram', state: 'Andhra Pradesh', platformCount: 5 },
  { code: 'KPD', name: 'Katpadi Junction', city: 'Vellore', state: 'Tamil Nadu', platformCount: 5 },
  { code: 'GTL', name: 'Guntakal Junction', city: 'Guntakal', state: 'Andhra Pradesh', platformCount: 6 },
  { code: 'LPI', name: 'Lingampalli', city: 'Hyderabad', state: 'Telangana', platformCount: 4 },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana', platformCount: 6 },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Secunderabad', state: 'Telangana', platformCount: 10 },
  { code: 'WADI', name: 'Wadi Junction', city: 'Wadi', state: 'Karnataka', platformCount: 4 },
  { code: 'SA', name: 'Salem Junction', city: 'Salem', state: 'Tamil Nadu', platformCount: 6 },
  { code: 'ED', name: 'Erode Junction', city: 'Erode', state: 'Tamil Nadu', platformCount: 5 },
  { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu', platformCount: 6 },
  { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi', state: 'Kerala', platformCount: 6 },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala', platformCount: 7 },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', platformCount: 8 },
  { code: 'AII', name: 'Ajmer Junction', city: 'Ajmer', state: 'Rajasthan', platformCount: 6 },
  { code: 'ABR', name: 'Abu Road', city: 'Sirohi', state: 'Rajasthan', platformCount: 4 },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', platformCount: 10 },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra', platformCount: 7 },
  { code: 'VAPI', name: 'Vapi', city: 'Vapi', state: 'Gujarat', platformCount: 4 },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat', platformCount: 8 },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab', platformCount: 8 },
  { code: 'BPQ', name: 'Balharshah Junction', city: 'Balharshah', state: 'Maharashtra', platformCount: 5 },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', platformCount: 8 },
  { code: 'BSP', name: 'Bilaspur Junction', city: 'Bilaspur', state: 'Chhattisgarh', platformCount: 8 },
  { code: 'RYP', name: 'Raipur Junction', city: 'Raipur', state: 'Chhattisgarh', platformCount: 6 },
  { code: 'RNC', name: 'Ranchi', city: 'Ranchi', state: 'Jharkhand', platformCount: 5 },
  { code: 'ROU', name: 'Rourkela', city: 'Rourkela', state: 'Odisha', platformCount: 5 },
  { code: 'DNR', name: 'Danapur', city: 'Patna', state: 'Bihar', platformCount: 6 },
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
