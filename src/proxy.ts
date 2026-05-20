import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { edgeAuth } from '@/features/auth/server/auth-edge';
import {
  AUTH_ROUTES,
  EMAIL_VERIFICATION_EXEMPT_ROUTES,
  PROTECTED_ROUTES,
} from '@/features/auth/config/access';
import { APP_ROUTES } from '@/features/auth/config/app-routes';
import { matchRoute, extractLocale } from '@/features/auth/lib/match-route';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

function withLocalePath(pathname: string, internalPath: string): string {
  const locale = extractLocale(pathname);
  if (internalPath === '/') return `/${locale}`;
  return `/${locale}${internalPath}`;
}

export const proxy = edgeAuth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(req as NextRequest);
  const isLoggedIn = Boolean(req.auth?.user?.id);
  const isEmailVerified = Boolean(req.auth?.user?.isEmailVerified);

  const isAuthRoute = matchRoute(pathname, AUTH_ROUTES, 'exact');
  const isVerifyConfirmRoute = matchRoute(
    pathname,
    [APP_ROUTES.AUTH.VERIFY_EMAIL_CONFIRM],
    'exact',
  );
  const isProtectedRoute = matchRoute(pathname, PROTECTED_ROUTES, 'prefix');
  const isVerificationExempt = matchRoute(pathname, EMAIL_VERIFICATION_EXEMPT_ROUTES, 'prefix');

  if (isLoggedIn && isAuthRoute && isEmailVerified && !isVerifyConfirmRoute) {
    const locale = extractLocale(pathname);
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  if (isLoggedIn && !isEmailVerified && isProtectedRoute && !isVerificationExempt) {
    const verifyPath = withLocalePath(pathname, APP_ROUTES.AUTH.VERIFY_EMAIL);
    const email = req.auth?.user?.email;
    const target = email
      ? `${verifyPath}?email=${encodeURIComponent(email)}`
      : verifyPath;
    return NextResponse.redirect(new URL(target, req.url));
  }

  if (isProtectedRoute && !isLoggedIn) {
    const locale = extractLocale(pathname);
    const signInPath = `/${locale}${APP_ROUTES.AUTH.SIGN_IN}`;
    const signInUrl = new URL(signInPath, req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlResponse;
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
