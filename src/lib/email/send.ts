import { emailConfig } from './config';
import { nodemailerProvider } from './providers/nodemailer';
import { buildVerificationEmail } from './templates/verification-email';
import type { EmailProvider, EmailLocale, VerificationEmailParams } from './types';

/** Active email provider — swap implementation for Resend, SendGrid, etc. */
let activeProvider: EmailProvider = nodemailerProvider;

export function setEmailProvider(provider: EmailProvider): void {
  activeProvider = provider;
}

export async function sendVerificationEmail(
  params: VerificationEmailParams,
): Promise<void> {
  const { subject, html, text } = buildVerificationEmail(params);

  await activeProvider.send({
    to: params.to,
    subject,
    html,
    text,
  });
}

export function buildVerificationUrl(locale: EmailLocale, token: string): string {
  const base = emailConfig.baseUrl.replace(/\/$/, '');
  return `${base}/${locale}/verify-email/confirm?token=${encodeURIComponent(token)}`;
}
