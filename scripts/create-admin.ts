#!/usr/bin/env tsx
/* eslint-disable no-console */

/**
 * Create initial admin user
 *
 * Run with: npm run create-admin
 */

import { resolve } from 'path';
import readline from 'readline';

import { config } from 'dotenv';

import { prisma } from '@/lib/prisma/client';
import { authService } from '@/lib/services/authService';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdmin() {
  console.log('👤 Create Initial Admin User\n');

  // Check if admin exists
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) {
    console.log('❌ Admin users already exist. This script is only for initial setup.');
    process.exit(1);
  }

  console.log('This will create the first admin user (superadmin).\n');

  const name = await question('Name: ');
  const email = await question('Email: ');
  let password = '';
  let confirmPassword = '';

  do {
    password = await question('Password (min 8 chars, with uppercase, number, special): ');
    confirmPassword = await question('Confirm password: ');

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match\n');
    }
  } while (password !== confirmPassword);

  try {
    const admin = await authService.createInitialAdmin({
      email,
      password,
      name,
    });

    console.log('\n✅ Admin created successfully!');
    console.log(` ID: ${admin.id}`);
    console.log(` Email: ${admin.email}`);
    console.log(` Role: ${admin.role}`);
    console.log('\nYou can now login at /admin/login');
  } catch (error) {
    console.error('\n❌ Failed to create admin:', error instanceof Error ? error.message : error);
  }

  rl.close();
}

createAdmin();
