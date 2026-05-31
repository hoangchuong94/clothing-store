'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FilterSelectProps<TValue extends string> {
  label: string;
  placeholder: string;
  value?: TValue;
  options: Array<{ value: TValue; label: string }>;
  onChange: (value: TValue | undefined) => void;
  active?: boolean;
}

export function FilterSelect<TValue extends string>({
  label,
  placeholder,
  value,
  options,
  onChange,
  active = false,
}: FilterSelectProps<TValue>) {
  return (
    <div className="space-y-3">
      <Label className="text-muted-foreground text-xs tracking-[0.25em] uppercase">{label}</Label>
      <Select
        value={value || ''}
        onValueChange={(nextValue) => onChange((nextValue || undefined) as TValue | undefined)}
      >
        <SelectTrigger
          className={cn(
            'focus-visible:border-ring focus-visible:ring-ring/50 flex h-11 w-full items-center justify-between rounded-4xl border px-4 text-sm transition focus-visible:ring-[3px]',
            active ? 'text-foreground border-teal-400' : 'border-input text-foreground',
          )}
          aria-label={label}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-border bg-popover text-foreground overflow-hidden rounded-4xl border shadow-lg">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
