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
        'fixed top-6 left-1/2 z-50 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 rounded-3xl border px-5 py-4 text-sm shadow-xl shadow-slate-950/10',
        variant === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-950',
        variant === 'info' && 'border-slate-200 bg-slate-50 text-slate-950',
        variant === 'error' && 'border-rose-200 bg-rose-50 text-rose-950',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
