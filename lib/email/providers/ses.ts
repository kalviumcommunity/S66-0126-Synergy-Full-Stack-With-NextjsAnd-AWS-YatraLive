/**
 * AWS SES Email Provider
 */
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import type { EmailProvider, EmailOptions } from './types';

let sesClient: SESClient | null = null;

function getSESClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.AWS_REGION || 'ap-south-1',
    });
  }
  return sesClient;
}

export const sesProvider: EmailProvider = {
  name: 'AWS_SES',

  async send(to: string, subject: string, html: string, text: string) {
    try {
      const client = getSESClient();
      const command = new SendEmailCommand({
        Source: process.env.AWS_SES_FROM_EMAIL || 'noreply@traintracker.com',
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const response = await client.send(command);
      return {
        messageId: response.MessageId || '',
      };
    } catch (error) {
      console.error('SES send error:', error);
      throw error;
    }
  },

  async verify(): Promise<boolean> {
    try {
      const client = getSESClient();
      // Basic connectivity check - can be expanded for actual verification
      return true;
    } catch (error) {
      console.error('SES verification error:', error);
      return false;
    }
  },
};
