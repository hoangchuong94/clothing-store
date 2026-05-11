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
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">Something went wrong</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>

        <div className="mt-3 flex gap-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="text-red-700 hover:bg-red-100"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>

      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-red-400 hover:text-red-600">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
