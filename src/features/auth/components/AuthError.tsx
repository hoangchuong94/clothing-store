'use client';

/**
 * AuthError component
 * Displays authentication errors with proper styling and accessibility
 */

import { useTranslations } from 'next-intl';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuthError } from '../types/auth.types';

interface AuthErrorProps {
  error: AuthError | null;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Error display component with accessibility support
 * Shows localized error messages with dismiss option
 */
export function AuthErrorDisplay({ error, onDismiss, className = '' }: AuthErrorProps) {
  const t = useTranslations();

  if (!error) return null;

  // Get the error message - could be a translation key or raw text.
  // If the translation key is missing, fall back to raw message text.
  let displayMessage = error.message;
  if (error.isTranslated === false) {
    try {
      displayMessage = t(error.message);
    } catch {
      displayMessage = error.message;
    }
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`rounded-lg border border-rose-300 bg-rose-50 p-4 dark:border-rose-800/50 dark:bg-rose-950/30 ${className}`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-rose-800 dark:text-rose-200">{displayMessage}</p>

          {error.details && Object.keys(error.details).length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-rose-700 hover:underline dark:text-rose-300">
                {t('common.details')}
              </summary>
              <pre className="mt-1 max-h-32 overflow-auto text-xs text-rose-600 dark:text-rose-400">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
        </div>

        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            aria-label={t('common.dismiss')}
            className="shrink-0 text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Auth error display with custom className
 * More concise version for inline usage
 */
export function AuthErrorAlert({ error, onDismiss }: Omit<AuthErrorProps, 'className'>) {
  const t = useTranslations('auth');

  if (!error) return null;

  let displayMessage = error.message;
  if (error.isTranslated === false) {
    try {
      displayMessage = t(error.message);
    } catch {
      displayMessage = error.message;
    }
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center justify-between gap-3 rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
    >
      <span>{displayMessage}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('common.dismiss')}
          className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default AuthErrorDisplay;
