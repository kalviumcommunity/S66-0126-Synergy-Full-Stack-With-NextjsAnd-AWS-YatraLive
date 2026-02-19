/**
 * Worker Email Hooks
 * Triggers email notifications based on train events
 */
import { prisma } from '@/lib/prisma/client';
import {
  sendDelayAlert,
  sendPlatformChangeAlert,
  getSubscription,
} from '@/lib/services/emailService';
import type { Train } from '@/types';

import { logger } from '../utils/logger';

const DELAY_THRESHOLD_MINUTES = 5; // Send alert if delay >= 5 minutes
const PREVIOUS_DELAYS: Map<string, number> = new Map(); // Track previous delays

/**
 * Check for significant delays and send alerts
 */
export async function checkAndSendDelayAlerts(trains: Train[]) {
  try {
    for (const train of trains) {
      const currentDelay = train.delayMinutes;
      const previousDelay = PREVIOUS_DELAYS.get(train.id) || 0;

      // Send alert if delay crossed threshold or significantly increased
      if (
        currentDelay >= DELAY_THRESHOLD_MINUTES &&
        (previousDelay < DELAY_THRESHOLD_MINUTES || currentDelay - previousDelay >= 10)
      ) {
        await sendDelayAlertsToSubscribers(train);
      }

      // Update previous delay
      PREVIOUS_DELAYS.set(train.id, currentDelay);
    }
  } catch (error) {
    logger.error('Error checking delay alerts:', error);
  }
}

/**
 * Send delay alerts to all subscribers
 */
async function sendDelayAlertsToSubscribers(train: Train) {
  try {
    // Get all verified subscribers
    const subscribers = await prisma.emailSubscription.findMany({
      where: {
        isVerified: true,
        isActive: true,
      },
    });

    for (const subscriber of subscribers) {
      try {
        // Check if subscriber enabled delay alerts
        const prefs = subscriber.preferences as { delayAlerts?: boolean } | null;
        if (prefs && prefs.delayAlerts === false) {
          continue;
        }

        await sendDelayAlert(subscriber.email, {
          trainNumber: train.number,
          trainName: train.name,
          source: train.source,
          destination: train.destination,
          scheduledTime: train.scheduledArrival,
          currentDelay: train.delayMinutes,
          estimatedDelay: Math.min(train.delayMinutes + 5, 120), // Estimate +5 min
          reason: 'Track maintenance', // Can be dynamic based on status
        });

        logger.info(`Sent delay alert to ${subscriber.email} for train ${train.number}`);
      } catch (error) {
        logger.error(`Failed to send alert to ${subscriber.email}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error sending delay alerts:', error);
  }
}

/**
 * Track platform changes and send alerts
 */
const PREVIOUS_PLATFORMS: Map<string, number> = new Map();

export async function checkAndSendPlatformChangeAlerts(trains: Train[]) {
  try {
    for (const train of trains) {
      const currentPlatform = train.platform;
      const previousPlatform = PREVIOUS_PLATFORMS.get(train.id);

      // Send alert if platform changed
      if (previousPlatform !== undefined && currentPlatform !== previousPlatform) {
        await sendPlatformChangeAlertsToSubscribers(train, previousPlatform);
      }

      // Update previous platform
      if (currentPlatform) {
        PREVIOUS_PLATFORMS.set(train.id, currentPlatform);
      }
    }
  } catch (error) {
    logger.error('Error checking platform changes:', error);
  }
}

/**
 * Send platform change alerts to all subscribers
 */
async function sendPlatformChangeAlertsToSubscribers(train: Train, previousPlatform: number) {
  try {
    // Get all verified subscribers
    const subscribers = await prisma.emailSubscription.findMany({
      where: {
        isVerified: true,
        isActive: true,
      },
    });

    for (const subscriber of subscribers) {
      try {
        // Check if subscriber enabled platform change alerts
        const prefs = subscriber.preferences as { platformChanges?: boolean } | null;
        if (prefs && prefs.platformChanges === false) {
          continue;
        }

        await sendPlatformChangeAlert(subscriber.email, {
          trainNumber: train.number,
          trainName: train.name,
          source: train.source,
          destination: train.destination,
          oldPlatform: String(previousPlatform),
          newPlatform: String(train.platform),
          station: train.route[train.currentStationIndex] || 'Unknown',
          reason: 'Track reassignment due to operational changes',
        });

        logger.info(`Sent platform change alert to ${subscriber.email} for train ${train.number}`);
      } catch (error) {
        logger.error(`Failed to send alert to ${subscriber.email}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error sending platform change alerts:', error);
  }
}
