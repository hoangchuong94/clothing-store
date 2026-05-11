'use client';

import { Card } from '@/components/ui/card';
import { FilterPanelContent } from './FilterPanelContent';
import type { ProductFilters, AvailableProductFilters } from '../types';

type RangeValue = [number, number];

interface FilterPanelDesktopProps {
  availableFilters: AvailableProductFilters;
  draftFilters: ProductFilters;
  onCategoryChange: (value: string | undefined) => void;
  onBadgeChange: (value: string | undefined) => void;
  onGenderChange: (value: string | undefined) => void;
  onSortChange: (value: ProductFilters['sort'] | undefined) => void;
  onPriceChange: (value: RangeValue) => void;
  onClear: () => void;
  activeFiltersCount: number;
}

export function FilterPanelDesktop({
  availableFilters,
  draftFilters,
  onCategoryChange,
  onBadgeChange,
  onGenderChange,
  onSortChange,
  onPriceChange,
  onClear,
  activeFiltersCount,
}: FilterPanelDesktopProps) {
  return (
    <div className="hidden lg:block">
      <Card className="border border-slate-200/70 bg-white/90 py-4 shadow-sm shadow-slate-900/10 dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-slate-950/20">
        <FilterPanelContent
          availableFilters={availableFilters}
          draftFilters={draftFilters}
          onCategoryChange={onCategoryChange}
          onBadgeChange={onBadgeChange}
          onGenderChange={onGenderChange}
          onSortChange={onSortChange}
          onPriceChange={onPriceChange}
          onClear={onClear}
          activeFiltersCount={activeFiltersCount}
        />
      </Card>
    </div>
  );
}
