import { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

export function isLocale(value: string): value is Locale {
  return routing.locales.includes(value as Locale);
}

export function stripLocale(pathname: string) {
  const [, first, ...rest] = pathname.split('/');

  if (first && isLocale(first)) {
    const stripped = `/${rest.join('/')}`;
    return stripped === '' ? '/' : stripped;
  }

  return pathname;
}

export function extractLocale(pathname: string): Locale {
  const [, first] = pathname.split('/');

  if (first && isLocale(first)) {
    return first;
  }
  return routing.defaultLocale;
}

const routeCache = new Map<string, string>();

export function resolveInternalPath(pathname: string) {
  if (routeCache.has(pathname)) {
    return routeCache.get(pathname)!;
  }

  const locale = extractLocale(pathname);
  const pathWithoutLocale = stripLocale(pathname);
  const pathnames = (routing as unknown as { pathnames?: Record<string, Record<Locale, string>> })
    .pathnames;

  if (pathnames) {
    for (const [internal, localizedMap] of Object.entries(pathnames)) {
      const localizedPath = localizedMap[locale as keyof typeof localizedMap];

      if (
        pathWithoutLocale === localizedPath ||
        pathWithoutLocale.startsWith(localizedPath + '/')
      ) {
        routeCache.set(pathname, internal);
        return internal;
      }
    }
  }

  routeCache.set(pathname, pathWithoutLocale);
  return pathWithoutLocale;
}

type MatchMode = 'exact' | 'prefix';

export function matchRoute(
  pathname: string,
  routes: readonly string[],
  mode: MatchMode = 'prefix',
) {
  const internalPath = resolveInternalPath(pathname);

  return routes.some((route) => {
    if (mode === 'exact') {
      return internalPath === route;
    }

    if (route === '/') {
      return internalPath === '/';
    }

    return internalPath === route || internalPath.startsWith(route + '/');
  });
}
