/**
 * SendGrid Email Provider
 */
import sgMail from '@sendgrid/mail';

import type { EmailProvider } from './types';

let isInitialized = false;

function initializeSendGrid() {
  if (!isInitialized && process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    isInitialized = true;
  }
}

export const sendgridProvider: EmailProvider = {
  name: 'SENDGRID',

  async send(to: string, subject: string, html: string, text: string) {
    try {
      initializeSendGrid();

      const message = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@traintracker.com',
        subject,
        html,
        text,
      };

      const response = await sgMail.send(message);
      const messageId = response[0].headers['x-message-id'] || '';
      return { messageId };
    } catch (error) {
      console.error('SendGrid send error:', error);
      throw error;
    }
  },

  async verify(): Promise<boolean> {
    try {
      initializeSendGrid();
      return isInitialized;
    } catch (error) {
      console.error('SendGrid verification error:', error);
      return false;
    }
  },
};
