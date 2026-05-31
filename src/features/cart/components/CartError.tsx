/**
 * CartError Component
 * Displays error messages with retry button
 */

'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function CartError({ error, onRetry, onDismiss }: CartErrorProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-800/50 dark:bg-rose-950/30">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />

      <div className="flex-1">
        <p className="text-sm font-medium text-rose-800 dark:text-rose-200">Something went wrong</p>
        <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">{error}</p>

        <div className="mt-3 flex gap-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-rose-200 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/20"
            >
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="text-rose-700 hover:bg-rose-100 dark:text-rose-200 dark:hover:bg-rose-900/20"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>

      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-rose-400 hover:text-rose-600">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
