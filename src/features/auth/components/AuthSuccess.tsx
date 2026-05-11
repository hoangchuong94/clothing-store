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
      className={`rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-800/50 dark:bg-green-950/30 ${className}`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">{displayMessage}</p>
        </div>

        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            aria-label={t('common.dismiss')}
            className="shrink-0 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/20"
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
      className="flex items-center justify-between gap-3 rounded-3xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
    >
      <span>{displayMessage}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('common.dismiss')}
          className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default AuthSuccessDisplay;
