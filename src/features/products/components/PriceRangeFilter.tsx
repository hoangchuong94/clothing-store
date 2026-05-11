'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type RangeValue = [number, number];

interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: RangeValue;
  onValueChange: (value: RangeValue) => void;
  active?: boolean;
  label?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function PriceRangeFilter({
  min,
  max,
  value,
  onValueChange,
  active = false,
  label = 'Price range',
}: PriceRangeFilterProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label className="text-muted-foreground text-xs tracking-[0.25em] uppercase">
            {label}
          </Label>
          <p className="text-foreground/80 text-sm">
            {formatCurrency(value[0])} – {formatCurrency(value[1])}
          </p>
        </div>
        <Badge variant={active ? 'secondary' : 'outline'}>
          {formatCurrency(min)} - {formatCurrency(max)}
        </Badge>
      </div>

      <Slider
        className={cn(
          'relative flex h-11 w-full touch-none items-center select-none',
          active ? 'opacity-100' : 'opacity-90',
        )}
        value={value}
        min={min}
        max={max}
        step={1}
        onValueChange={onValueChange}
        aria-label={label}
      />
    </>
  );
}
