/**
 * Authentication redirect utilities
 * Handles post-authentication navigation and URL management
 */

import { redirect } from 'next/navigation';
import { getRedirectUrlForRole } from './callback-url';

/**
 * Perform authenticated redirect
 * Handles role-based redirection after successful authentication
 */
export function performAuthRedirect(userRole?: string, fallbackUrl?: string): void {
  const redirectUrl = getRedirectUrlForRole(userRole) || fallbackUrl || '/';
  redirect(redirectUrl);
}

/**
 * Safe redirect with validation
 * Prevents open redirect vulnerabilities
 */
export function safeRedirect(url: string, fallbackUrl = '/'): void {
  try {
    const parsed = new URL(
      url,
      typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000',
    );

    // Only allow same-origin redirects
    if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
      redirect(fallbackUrl);
      return;
    }

    redirect(parsed.pathname);
  } catch {
    redirect(fallbackUrl);
  }
}

/**
 * Build redirect URL with params
 */
export function buildRedirectUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(
    baseUrl,
    typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000',
  );

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.pathname + url.search;
}
