/**
 * Email provider types and interfaces
 */

export interface EmailProvider {
  name: string;
  send(to: string, subject: string, html: string, text: string): Promise<{ messageId: string }>;
  verify(): Promise<boolean>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}
