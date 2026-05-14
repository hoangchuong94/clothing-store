'use client';

/**
 * useAuthRedirect hook
 * Handles authentication redirects with proper cleanup
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { validateCallbackUrl } from '../lib/callback-url';
import { AuthLogger } from '../lib/auth-logger';

export function useAuthRedirect() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  /**
   * Redirect with validation and cleanup
   */
  const redirectAfterAuth = useCallback(
    (url: string, delay: number = 500) => {
      const validatedUrl = validateCallbackUrl(url);

      AuthLogger.info('Redirecting after auth', { url: validatedUrl, delay });

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        router.push(validatedUrl);
        timeoutRef.current = null;
      }, delay);
    },
    [router],
  );

  /**
   * Cancel pending redirect
   */
  const cancelRedirect = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      AuthLogger.debug('Auth redirect cancelled');
    }
  }, []);

  return {
    redirectAfterAuth,
    cancelRedirect,
  };
}
