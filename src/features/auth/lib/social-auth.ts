/**
 * Social authentication utilities
 * Handles OAuth provider logic and redirect configuration
 */

import { signIn } from 'next-auth/react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { SocialProvider } from '../types/auth.types';

/**
 * Social provider configuration
 */
export const SOCIAL_PROVIDERS = {
  google: {
    id: 'google',
    name: 'Google',
    icon: 'GoogleIcon',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: 'GithubIcon',
  },
} as const;

/**
 * Sign in with social provider
 * Handles OAuth flow with proper error handling
 */
export async function signInWithProvider(
  provider: SocialProvider,
  callbackUrl?: string,
): Promise<void> {
  try {
    await signIn(provider, {
      callbackUrl: callbackUrl || '/',
      redirect: true,
    });
  } catch (error) {
    // NextAuth throws errors for certain cases
    console.error(`OAuth error for ${provider}:`, error);
    throw error;
  }
}

/**
 * Get OAuth error from URL params
 * Extracts OAuth-specific error information from redirect URL
 */
export function getOAuthErrorFromUrl(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): { error: string; email?: string } | null {
  const error = searchParams.get('error');
  const email = searchParams.get('email');

  if (!error) return null;

  return {
    error,
    ...(email && { email }),
  };
}

/**
 * Determine if error is OAuth account linking error
 */
export function isOAuthAccountLinkingError(error: string): boolean {
  return error === 'OAuthAccountNotLinked';
}

/**
 * Get provider from error details
 */
export function getProviderFromEmail(
  email: string,
  providers: Record<string, string[]> = {},
): SocialProvider | null {
  // This would typically query a database to find linked providers
  // For now, return null - implement based on your needs
  void email;
  void providers;
  return null;
}

/**
 * Retry OAuth after fixing account linking
 */
export function retryOAuthFlow(provider: SocialProvider, callbackUrl?: string): void {
  // Clear any error state
  const url = new URL(window.location.href);
  url.searchParams.delete('error');
  url.searchParams.delete('email');

  // Retry the OAuth flow
  void signInWithProvider(provider, callbackUrl);
}

/**
 * Validate provider
 */
export function isValidProvider(provider: unknown): provider is SocialProvider {
  return provider === 'google' || provider === 'github';
}

/**
 * Get provider display name
 */
export function getProviderName(provider: SocialProvider): string {
  return SOCIAL_PROVIDERS[provider]?.name || provider;
}
