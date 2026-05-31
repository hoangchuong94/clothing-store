import * as React from 'react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastState {
  message: string;
  variant: ToastVariant;
}

interface ToastBannerProps extends ToastState {
  onClose: () => void;
}

export function ToastBanner({ message, variant, onClose }: ToastBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-6 left-1/2 z-50 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 rounded-3xl border px-5 py-4 text-sm shadow-xl shadow-teal-500/10',
        variant === 'success' && 'border-teal-200 bg-teal-50 text-teal-950',
        variant === 'info' && 'border-amber-200 bg-amber-50 text-amber-950',
        variant === 'error' && 'border-rose-200 bg-rose-50 text-rose-950',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-background/70 hover:text-foreground rounded-full p-2 transition"
          aria-label="Dismiss notification"
        >
          x
        </button>
      </div>
    </div>
  );
}
