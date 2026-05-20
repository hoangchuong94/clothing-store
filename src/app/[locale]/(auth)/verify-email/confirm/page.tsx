import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { VerifyEmailConfirm } from '@/features/auth/components/verification/VerifyEmailConfirm';
import { APP_ROUTES } from '@/features/auth/config/app-routes';
import { redirect } from '@/i18n/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

/**
 * Email links land here with a token query param.
 * Verification runs only after the user confirms (client action), not on GET,
 * so inbox link scanners cannot consume single-use tokens.
 */
export default async function VerifyEmailConfirmPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const locale = await getLocale();
  const rawToken = token?.trim();

  if (!rawToken) {
    redirect({
      href: `${APP_ROUTES.AUTH.VERIFY_EMAIL_ERROR}?reason=invalid`,
      locale,
    });
    return;
  }

  return <VerifyEmailConfirm token={rawToken} />;
}
