import { routing } from '@/i18n/routing';

export type EmailLocale = (typeof routing.locales)[number];

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface VerificationEmailParams {
  to: string;
  name: string | null;
  verificationUrl: string;
  locale: EmailLocale;
  expiresInHours: number;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<void>;
}
