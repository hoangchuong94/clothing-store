import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: {
      header: (await import(`../../messages/${locale}/header.json`)).default,
      home: (await import(`../../messages/${locale}/home.json`)).default,
      footer: (await import(`../../messages/${locale}/footer.json`)).default,
      errors: (await import(`../../messages/${locale}/errors.json`)).default,
      notFound: (await import(`../../messages/${locale}/notFound.json`)).default,
      auth: (await import(`../../messages/${locale}/auth.json`)).default,
      products: (await import(`../../messages/${locale}/products.json`)).default,
    },
  };
});
