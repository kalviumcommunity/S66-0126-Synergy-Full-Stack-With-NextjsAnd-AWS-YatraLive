/**
 * Email Service
 * Comprehensive email management: subscriptions, sending, logging
 */
import { render } from '@react-email/render';
import { prisma } from '@/lib/prisma/client';
import { getEmailProvider } from '@/lib/email/providers/factory';
import { DelayAlertEmail, DelayAlertPlainText } from '@/lib/email/templates/DelayAlert';
import {
  PlatformChangeEmail,
  PlatformChangeePlainText,
} from '@/lib/email/templates/PlatformChange';
import { v4 as uuid } from 'uuid';

const MAX_EMAILS_PER_MINUTE = 10;
const MAX_SUBSCRIPTIONS_PER_EMAIL = 5;

// ==========================================
// SUBSCRIPTION MANAGEMENT
// ==========================================

export async function subscribeToEmails(email: string) {
  try {
    // Check max subscriptions limit
    const existingCount = await prisma.emailSubscription.count();
    if (existingCount >= MAX_SUBSCRIPTIONS_PER_EMAIL) {
      throw new Error(`Maximum subscriptions (${MAX_SUBSCRIPTIONS_PER_EMAIL}) reached`);
    }

    const verificationToken = uuid();
    const unsubscribeToken = uuid();

    const subscription = await prisma.emailSubscription.upsert({
      where: { email },
      update: {
        verificationToken,
        isActive: true,
        preferences: {
          delayAlerts: true,
          platformChanges: true,
          dailyDigest: false,
        },
      },
      create: {
        email,
        verificationToken,
        unsubscribeToken,
        preferences: {
          delayAlerts: true,
          platformChanges: true,
          dailyDigest: false,
        },
      },
    });

    return {
      success: true,
      subscription,
      verificationToken,
    };
  } catch (error) {
    console.error('Subscribe error:', error);
    throw error;
  }
}

export async function verifyEmailSubscription(token: string) {
  try {
    const subscription = await prisma.emailSubscription.updateMany({
      where: { verificationToken: token },
      data: {
        isVerified: true,
        verificationToken: null,
        verifiedAt: new Date(),
      },
    });

    if (subscription.count === 0) {
      throw new Error('Invalid verification token');
    }

    return { success: true };
  } catch (error) {
    console.error('Verify error:', error);
    throw error;
  }
}

export async function unsubscribeFromEmails(token: string) {
  try {
    const subscription = await prisma.emailSubscription.updateMany({
      where: { unsubscribeToken: token },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    if (subscription.count === 0) {
      throw new Error('Invalid unsubscribe token');
    }

    return { success: true };
  } catch (error) {
    console.error('Unsubscribe error:', error);
    throw error;
  }
}

export async function getSubscription(email: string) {
  try {
    const subscription = await prisma.emailSubscription.findUnique({
      where: { email },
    });
    return subscription;
  } catch (error) {
    console.error('Get subscription error:', error);
    throw error;
  }
}

export async function updateSubscriptionPreferences(
  email: string,
  preferences: Record<string, unknown>
) {
  try {
    const subscription = await prisma.emailSubscription.update({
      where: { email },
      data: { preferences: preferences as unknown as undefined },
    });
    return subscription;
  } catch (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
}

// ==========================================
// EMAIL SENDING
// ==========================================

export async function sendDelayAlert(
  email: string,
  data: {
    trainNumber: string;
    trainName: string;
    source: string;
    destination: string;
    scheduledTime: string;
    currentDelay: number;
    estimatedDelay: number;
    reason?: string;
  }
) {
  try {
    const provider = getEmailProvider();

    const htmlContent = await render(
      <DelayAlertEmail
        email={email}
        trainNumber={data.trainNumber}
        trainName={data.trainName}
        source={data.source}
        destination={data.destination}
        scheduledTime={data.scheduledTime}
        currentDelay={data.currentDelay}
        estimatedDelay={data.estimatedDelay}
        reason={data.reason}
      />
    );

    const textContent = DelayAlertPlainText({
      email,
      trainNumber: data.trainNumber,
      trainName: data.trainName,
      source: data.source,
      destination: data.destination,
      scheduledTime: data.scheduledTime,
      currentDelay: data.currentDelay,
      estimatedDelay: data.estimatedDelay,
      reason: data.reason,
    });

    const result = await provider.send(
      email,
      `Train ${data.trainNumber} Delayed by ${data.currentDelay} Minutes`,
      htmlContent,
      textContent
    );

    // Log email
    await prisma.emailLog.create({
      data: {
        to: email,
        subject: `Train ${data.trainNumber} Delayed by ${data.currentDelay} Minutes`,
        template: 'DELAY_ALERT',
        trainNumber: data.trainNumber,
        delayMinutes: data.currentDelay,
        status: 'SENT',
        provider: process.env.EMAIL_PROVIDER || 'AWS_SES',
        providerMessageId: result.messageId,
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Send delay alert error:', error);

    // Log failed email
    await prisma.emailLog.create({
      data: {
        to: email,
        subject: `Train ${data.trainNumber} Delayed by ${data.currentDelay} Minutes`,
        template: 'DELAY_ALERT',
        trainNumber: data.trainNumber,
        delayMinutes: data.currentDelay,
        status: 'FAILED',
        provider: process.env.EMAIL_PROVIDER || 'AWS_SES',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

export async function sendPlatformChangeAlert(
  email: string,
  data: {
    trainNumber: string;
    trainName: string;
    source: string;
    destination: string;
    oldPlatform: string;
    newPlatform: string;
    station: string;
    reason?: string;
  }
) {
  try {
    const provider = getEmailProvider();

    const htmlContent = await render(
      <PlatformChangeEmail
        email={email}
        trainNumber={data.trainNumber}
        trainName={data.trainName}
        source={data.source}
        destination={data.destination}
        oldPlatform={data.oldPlatform}
        newPlatform={data.newPlatform}
        station={data.station}
        reason={data.reason}
      />
    );

    const textContent = PlatformChangeePlainText({
      email,
      trainNumber: data.trainNumber,
      trainName: data.trainName,
      source: data.source,
      destination: data.destination,
      oldPlatform: data.oldPlatform,
      newPlatform: data.newPlatform,
      station: data.station,
      reason: data.reason,
    });

    const result = await provider.send(
      email,
      `Platform Change: Train ${data.trainNumber} at ${data.station}`,
      htmlContent,
      textContent
    );

    // Log email
    await prisma.emailLog.create({
      data: {
        to: email,
        subject: `Platform Change: Train ${data.trainNumber} at ${data.station}`,
        template: 'PLATFORM_CHANGE',
        trainNumber: data.trainNumber,
        platform: data.newPlatform,
        status: 'SENT',
        provider: process.env.EMAIL_PROVIDER || 'AWS_SES',
        providerMessageId: result.messageId,
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Send platform change alert error:', error);

    // Log failed email
    await prisma.emailLog.create({
      data: {
        to: email,
        subject: `Platform Change: Train ${data.trainNumber} at ${data.station}`,
        template: 'PLATFORM_CHANGE',
        trainNumber: data.trainNumber,
        platform: data.newPlatform,
        status: 'FAILED',
        provider: process.env.EMAIL_PROVIDER || 'AWS_SES',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

// ==========================================
// EMAIL LOGS
// ==========================================

export async function getEmailLogs(filters?: {
  email?: string;
  status?: string;
  template?: string;
  limit?: number;
}) {
  try {
    const limit = filters?.limit || 100;
    const logs = await prisma.emailLog.findMany({
      where: {
        ...(filters?.email && { to: filters.email }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.template && { template: filters.template }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs;
  } catch (error) {
    console.error('Get email logs error:', error);
    throw error;
  }
}
