'use client';

import * as React from 'react';
import type { ProductFilters, AvailableProductFilters } from '../types';
import { useProductFilters } from '../hooks/useProductFilters';
import { FilterPanelDesktop } from './FilterPanelDesktop';
import { FilterPanelMobile } from './FilterPanelMobile';

type RangeValue = [number, number];

interface FilterPanelProps {
  availableFilters: AvailableProductFilters;
  currentFilters: ProductFilters;
}

export function FilterPanel({ availableFilters, currentFilters }: FilterPanelProps) {
  const { filters, setFilters } = useProductFilters(currentFilters);
  const [draftFilters, setDraftFilters] = React.useState<ProductFilters>(filters);

  React.useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const activeFiltersCount = React.useMemo(() => {
    return [
      draftFilters.category ? 1 : 0,
      draftFilters.badge ? 1 : 0,
      draftFilters.gender ? 1 : 0,
      draftFilters.sort ? 1 : 0,
      draftFilters.minPrice !== undefined ? 1 : 0,
      draftFilters.maxPrice !== undefined ? 1 : 0,
    ].reduce((sum, value) => sum + value, 0);
  }, [draftFilters]);

  const handleCategoryChange = React.useCallback(
    (value: string | undefined) => {
      const newFilters = { ...draftFilters, category: value };
      setDraftFilters(newFilters);
      setFilters(newFilters);
    },
    [draftFilters, setFilters],
  );

  const handleBadgeChange = React.useCallback(
    (value: string | undefined) => {
      const newFilters = { ...draftFilters, badge: value };
      setDraftFilters(newFilters);
      setFilters(newFilters);
    },
    [draftFilters, setFilters],
  );

  const handleGenderChange = React.useCallback(
    (value: string | undefined) => {
      const newFilters = { ...draftFilters, gender: value as ProductFilters['gender'] };
      setDraftFilters(newFilters);
      setFilters(newFilters);
    },
    [draftFilters, setFilters],
  );

  const handleSortChange = React.useCallback(
    (value: ProductFilters['sort'] | undefined) => {
      const newFilters = { ...draftFilters, sort: value };
      setDraftFilters(newFilters);
      setFilters(newFilters);
    },
    [draftFilters, setFilters],
  );

  const handlePriceChange = React.useCallback(
    ([nextMin, nextMax]: RangeValue) => {
      const newFilters = {
        ...draftFilters,
        minPrice: nextMin === availableFilters.priceRange.min ? undefined : nextMin,
        maxPrice: nextMax === availableFilters.priceRange.max ? undefined : nextMax,
      };
      setDraftFilters(newFilters);
      setFilters(newFilters);
    },
    [draftFilters, setFilters, availableFilters.priceRange.max, availableFilters.priceRange.min],
  );

  const handleClearFilters = React.useCallback(() => {
    const clearedFilters = {
      category: undefined,
      badge: undefined,
      gender: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: undefined,
    };
    setDraftFilters(clearedFilters);
    setFilters(clearedFilters);
  }, [setFilters]);

  return (
    <>
      <FilterPanelMobile
        availableFilters={availableFilters}
        draftFilters={draftFilters}
        onCategoryChange={handleCategoryChange}
        onBadgeChange={handleBadgeChange}
        onGenderChange={handleGenderChange}
        onSortChange={handleSortChange}
        onPriceChange={handlePriceChange}
        onClear={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      <FilterPanelDesktop
        availableFilters={availableFilters}
        draftFilters={draftFilters}
        onCategoryChange={handleCategoryChange}
        onBadgeChange={handleBadgeChange}
        onGenderChange={handleGenderChange}
        onSortChange={handleSortChange}
        onPriceChange={handlePriceChange}
        onClear={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </>
  );
}
