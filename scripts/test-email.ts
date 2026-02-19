#!/usr/bin/env tsx

/**
 * Email System Testing Script
 * Tests email subscriptions, sending, and provider configuration
 */
import { verifyEmailProvider } from '@/lib/email/providers/factory';
import { prisma } from '@/lib/prisma/client';
import {
  subscribeToEmails,
  verifyEmailSubscription,
  sendDelayAlert,
  sendPlatformChangeAlert,
  getEmailLogs,
} from '@/lib/services/emailService';

const testEmail = 'test@traintracker.local';

async function printStatus(label: string, success: boolean, message?: string) {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${label}${message ? `: ${message}` : ''}`);
}

async function main() {
  console.log('\n📧 Email System Testing\n');

  try {
    // 1. Verify provider
    console.log('1️⃣  Verifying Email Provider...');
    const providerOk = await verifyEmailProvider();
    const provider = process.env.EMAIL_PROVIDER || 'AWS_SES';
    await printStatus(
      `Email Provider (${provider})`,
      providerOk,
      providerOk ? 'Connected' : 'Connection failed'
    );

    // 2. Test subscription
    console.log('\n2️⃣  Testing Email Subscription...');
    const subResult = await subscribeToEmails(testEmail);
    await printStatus('Create subscription', !!subResult.subscription, testEmail);

    const verificationToken = subResult.verificationToken;
    console.log(`   Verification token: ${verificationToken}`);

    // 3. Verify subscription
    console.log('\n3️⃣  Verifying Email Subscription...');
    await verifyEmailSubscription(verificationToken);
    const subscription = await prisma.emailSubscription.findUnique({
      where: { email: testEmail },
    });
    await printStatus('Email verified', !!subscription?.isVerified);

    // 4. Send delay alert
    console.log('\n4️⃣  Sending Delay Alert Email...');
    if (providerOk) {
      try {
        const delayResult = await sendDelayAlert(testEmail, {
          trainNumber: 'RAJ12345',
          trainName: 'Rajdhani Express',
          source: 'New Delhi',
          destination: 'Mumbai Central',
          scheduledTime: '08:15 AM',
          currentDelay: 15,
          estimatedDelay: 25,
          reason: 'Track maintenance at Jhansi',
        });
        await printStatus('Delay alert sent', !!delayResult.messageId);
        console.log(`   Message ID: ${delayResult.messageId}`);
      } catch (error) {
        await printStatus('Delay alert sent', false, String(error));
      }
    } else {
      console.log('   ⏭️  Skipped (provider not connected)');
    }

    // 5. Send platform change alert
    console.log('\n5️⃣  Sending Platform Change Alert...');
    if (providerOk) {
      try {
        const platformResult = await sendPlatformChangeAlert(testEmail, {
          trainNumber: 'RAJ12345',
          trainName: 'Rajdhani Express',
          source: 'New Delhi',
          destination: 'Mumbai Central',
          oldPlatform: '7',
          newPlatform: '9',
          station: 'New Delhi',
          reason: 'Platform reassignment due to operational changes',
        });
        await printStatus('Platform alert sent', !!platformResult.messageId);
        console.log(`   Message ID: ${platformResult.messageId}`);
      } catch (error) {
        await printStatus('Platform alert sent', false, String(error));
      }
    } else {
      console.log('   ⏭️  Skipped (provider not connected)');
    }

    // 6. Check email logs
    console.log('\n6️⃣  Checking Email Logs...');
    const logs = await getEmailLogs({ email: testEmail, limit: 10 });
    await printStatus(`Email logs retrieved`, true, `${logs.length} entries`);
    if (logs.length > 0) {
      logs.slice(0, 3).forEach((log: unknown, i: number) => {
        const logItem = log as { template: string; status: string; createdAt: Date };
        console.log(
          `   ${i + 1}. ${logItem.template} → ${logItem.status} (${logItem.createdAt.toISOString()})`
        );
      });
    }

    // 7. Summary
    console.log('\n📊 Summary:\n');
    console.log(`Email Provider: ${provider}`);
    console.log(`Test Email: ${testEmail}`);
    console.log(`Subscriptions: ${await prisma.emailSubscription.count()}`);
    console.log(`Email Logs: ${await prisma.emailLog.count()}`);

    console.log('\n✅ Email system testing complete!\n');
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
