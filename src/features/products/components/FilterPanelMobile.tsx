'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { FilterPanelContent } from './FilterPanelContent';
import type { ProductFilters, AvailableProductFilters } from '../types';

type RangeValue = [number, number];

interface FilterPanelMobileProps {
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

export function FilterPanelMobile({
  availableFilters,
  draftFilters,
  onCategoryChange,
  onBadgeChange,
  onGenderChange,
  onSortChange,
  onPriceChange,
  onClear,
  activeFiltersCount,
}: FilterPanelMobileProps) {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="border-border bg-background w-full justify-between hover:bg-teal-500/10"
          >
            <span>Filters</span>
            <Badge variant={activeFiltersCount ? 'secondary' : 'outline'}>
              {activeFiltersCount}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="max-w-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-teal-500 via-amber-400 to-rose-500" />
          <SheetHeader>
            <SheetTitle>Filter products</SheetTitle>
            <SheetDescription>Update filters and sort order with instant preview.</SheetDescription>
          </SheetHeader>
          <Card className="border-border bg-card rounded-none border">
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
