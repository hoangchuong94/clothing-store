/**
 * Callback URL utilities
 * Helper functions for callback URL handling
 */

import { APP_ROUTES } from '../config/app-routes';

/**
 * Validate callback URL for security
 * Prevents open redirect vulnerabilities
 */
export function validateCallbackUrl(url: string | null | undefined): string {
  if (!url) return '/';

  try {
    // Only allow relative URLs or same-origin absolute URLs
    const parsed = new URL(
      url,
      typeof window !== 'undefined'
        ? window.location.href
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost',
    );

    // Ensure same origin
    if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
      return '/';
    }

    // Ensure path starts with /
    return parsed.pathname.startsWith('/') ? parsed.pathname : '/';
  } catch {
    // Invalid URL format
    return '/';
  }
}

/**
 * Get redirect URL based on user role
 * Used in NextAuth callbacks to determine post-login redirect
 */
export function getRedirectUrlForRole(userRole?: string): string {
  if (!userRole) return '/';

  // Role-based redirect mapping
  const roleRedirects = APP_ROUTES.ROLE_REDIRECTS;

  return roleRedirects[userRole as keyof typeof roleRedirects] || '/';
}
