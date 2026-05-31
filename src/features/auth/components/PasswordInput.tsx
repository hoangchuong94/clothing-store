'use client';

import * as React from 'react';
import { Eye, EyeOff } from '@/components/ui/icon';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.ComponentPropsWithoutRef<'input'> {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export function PasswordInput({
  id,
  label,
  register,
  error,
  hint,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={cn('pr-12', className)}
          {...register}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((state) => !state)}
          className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-2 transition hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-300"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? (
        <p id={descriptionId} className="text-sm text-rose-500">
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-muted-foreground text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
