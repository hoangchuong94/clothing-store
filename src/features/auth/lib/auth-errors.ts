/**
 * Authentication error handling utilities
 * Centralized error mapping and translation support
 */

import type { AuthError, AuthErrorCode } from '../types/auth.types';
import { AUTH_ERROR_CODES } from '../types/auth.types';

/**
 * Maps authentication errors to translateable error codes
 * Ensures consistent error messages across the app
 */
export class AuthErrorHandler {
  /**
   * Create a structured auth error
   */
  static createError(
    code: AuthErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  ): AuthError {
    return {
      code,
      message: message || code,
      details,
      isTranslated: !!message, // If message provided, it's already translated
    };
  }

  /**
   * Map NextAuth errors to auth error codes
   */
  static mapNextAuthError(error: string | undefined): AuthError {
    if (!error) {
      return this.createError(AUTH_ERROR_CODES.UNKNOWN_ERROR);
    }

    // NextAuth error messages mapping
    const errorMap: Record<string, AuthErrorCode> = {
      CredentialsSignin: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      OAuthAccountNotLinked: AUTH_ERROR_CODES.ACCOUNT_NOT_LINKED,
      AccessDenied: AUTH_ERROR_CODES.OAUTH_ERROR,
      OAuthSignin: AUTH_ERROR_CODES.OAUTH_ERROR,
      OAuthCallback: AUTH_ERROR_CODES.OAUTH_ERROR,
    };

    const code = errorMap[error] || AUTH_ERROR_CODES.UNKNOWN_ERROR;
    return this.createError(code);
  }

  /**
   * Map database errors to auth error codes
   */
  static mapDatabaseError(error: unknown): AuthError {
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return this.createError(AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS);
      }
      if (error.message.includes('not found')) {
        return this.createError(AUTH_ERROR_CODES.EMAIL_NOT_FOUND);
      }
    }
    return this.createError(AUTH_ERROR_CODES.DATABASE_ERROR);
  }

  /**
   * Map validation errors from Zod
   */
  static mapValidationError(): AuthError {
    return this.createError(AUTH_ERROR_CODES.INVALID_FIELDS);
  }

  /**
   * Check if error is a certain type
   */
  static isError(error: unknown, code: AuthErrorCode): boolean {
    if (!error || typeof error !== 'object' || !('code' in error)) {
      return false;
    }
    return (error as AuthError).code === code;
  }

  /**
   * Safely get error message
   */
  static getErrorMessage(error: unknown): string {
    if (!error) return AUTH_ERROR_CODES.UNKNOWN_ERROR;

    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object' && 'code' in error) {
      return (error as AuthError).code;
    }

    return AUTH_ERROR_CODES.UNKNOWN_ERROR;
  }
}

/**
 * Check if a string is a translation key (doesn't contain spaces and follows pattern)
 */
export function isTranslationKey(value: string | undefined): boolean {
  if (!value) return false;
  // Translation keys typically follow pattern: "scope.key" or "scope.subkey.key"
  return !value.includes(' ') && value.includes('.');
}

/**
 * Format error for display
 * Prefers translation key if available, falls back to message
 */
export function formatAuthError(error: AuthError | string | undefined): string {
  if (!error) return AUTH_ERROR_CODES.UNKNOWN_ERROR;

  if (typeof error === 'string') {
    return error;
  }

  if (error.isTranslated === false && isTranslationKey(error.message)) {
    return error.message;
  }

  return error.message || error.code;
}

/**
 * Type guard for AuthError
 */
export function isAuthError(value: unknown): value is AuthError {
  return typeof value === 'object' && value !== null && 'code' in value && 'message' in value;
}
