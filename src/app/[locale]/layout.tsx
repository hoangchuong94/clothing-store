import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ReduxProvider } from '@/lib/client/providers/ReduxProvider';
import { AuthenticationProviders } from '@/features/auth/components/AuthProviders';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider locale={locale}>
      <ReduxProvider>
        <AuthenticationProviders>{children}</AuthenticationProviders>
      </ReduxProvider>
    </NextIntlClientProvider>
  );
}
