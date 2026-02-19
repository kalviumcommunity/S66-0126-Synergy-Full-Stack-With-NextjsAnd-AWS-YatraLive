/**
 * Email Provider Factory
 * Dynamically selects provider based on environment
 */
import { sendgridProvider } from './sendgrid';
import { sesProvider } from './ses';
import type { EmailProvider } from './types';

let activeProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (activeProvider) {
    return activeProvider;
  }

  const provider = process.env.EMAIL_PROVIDER || 'AWS_SES';

  if (provider === 'SENDGRID') {
    activeProvider = sendgridProvider;
  } else {
    activeProvider = sesProvider;
  }

  return activeProvider;
}

export function setEmailProvider(provider: EmailProvider) {
  activeProvider = provider;
}

export async function verifyEmailProvider(): Promise<boolean> {
  const provider = getEmailProvider();
  return provider.verify();
}
