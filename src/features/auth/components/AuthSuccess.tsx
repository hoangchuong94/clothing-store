'use client';

/**
 * AuthSuccess component
 * Displays authentication success messages with proper styling and accessibility
 */

import { useTranslations } from 'next-intl';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthSuccessProps {
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Success display component with accessibility support
 * Shows success messages with optional dismiss action
 */
export function AuthSuccessDisplay({ message, onDismiss, className = '' }: AuthSuccessProps) {
  const t = useTranslations();

  if (!message) return null;

  // If message contains space, treat as literal; otherwise as translation key.
  // If the translation is missing, fall back to the raw value.
  let displayMessage = message;
  if (!message.includes(' ')) {
    try {
      displayMessage = t(message);
    } catch {
      displayMessage = message;
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`rounded-lg border border-teal-300 bg-teal-50 p-4 dark:border-teal-800/50 dark:bg-teal-950/30 ${className}`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5">
          <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-teal-800 dark:text-teal-200">{displayMessage}</p>
        </div>

        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            aria-label={t('common.dismiss')}
            className="shrink-0 text-teal-600 hover:bg-teal-100 dark:text-teal-400 dark:hover:bg-teal-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact success display variant
 */
export function AuthSuccessAlert({ message, onDismiss }: Omit<AuthSuccessProps, 'className'>) {
  const t = useTranslations();

  if (!message) return null;

  const displayMessage = message.includes(' ') ? message : t(message);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-3 rounded-3xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200"
    >
      <span>{displayMessage}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('common.dismiss')}
          className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default AuthSuccessDisplay;
