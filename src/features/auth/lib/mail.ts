/**
 * @deprecated Use `@/lib/email/send` for new code.
 */
import {
  buildVerificationUrl,
  sendVerificationEmail as sendVerificationEmailFromService,
} from '@/lib/email/send';
import type { EmailLocale } from '@/lib/email/types';
import { verificationConfig } from './verification/config';

interface SendEmailProps {
  email: string;
  token: string;
  locale?: EmailLocale;
}

export async function sendVerificationEmail({ email, token, locale = 'en' }: SendEmailProps) {
  try {
    await sendVerificationEmailFromService({
      to: email,
      name: null,
      verificationUrl: buildVerificationUrl(locale, token),
      locale,
      expiresInHours: verificationConfig.tokenExpiryHours,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { error: 'Sending authentication email failed' };
  }
}

/** @deprecated Password reset — implement with dedicated token model */
export const sendVerificationForgotPassword = async (email: string, token: string) => {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000';
  console.warn('sendVerificationForgotPassword is not yet migrated to the email service', {
    email,
    token,
    base,
  });
};
