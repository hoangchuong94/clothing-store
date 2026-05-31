'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FilterSelect } from './FilterSelect';
import { PriceRangeFilter } from './PriceRangeFilter';
import type { ProductFilters, AvailableProductFilters } from '../types';

type RangeValue = [number, number];

type SortOptionValue = Exclude<ProductFilters['sort'], undefined>;

const SORT_OPTION_VALUES: SortOptionValue[] = ['priceAsc', 'priceDesc', 'ratingDesc'];

const SORT_OPTION_LABELS: Record<SortOptionValue, string> = {
  priceAsc: 'Price: Low to High',
  priceDesc: 'Price: High to Low',
  ratingDesc: 'Top Rated',
};

interface FilterPanelContentProps {
  availableFilters: AvailableProductFilters;
  draftFilters: ProductFilters;
  onCategoryChange: (value: string | undefined) => void;
  onBadgeChange: (value: string | undefined) => void;
  onGenderChange: (value: 'men' | 'women' | 'unisex' | undefined) => void;
  onSortChange: (value: ProductFilters['sort'] | undefined) => void;
  onPriceChange: (value: RangeValue) => void;
  onClear: () => void;
  activeFiltersCount: number;
}

function FilterPanelContentBase({
  availableFilters,
  draftFilters,
  onCategoryChange,
  onBadgeChange,
  onGenderChange,
  onSortChange,
  onPriceChange,
  onClear,
  activeFiltersCount,
}: FilterPanelContentProps) {
  const t = useTranslations('products.filters');

  const labels = useMemo(
    () => ({
      title: t('title') || 'Filters',
      heading: t('heading') || 'Refine your search',
      subtitle:
        t('subtitle') || 'Fine-tune products, sort quickly, and preview results without reload.',
      category: t('category') || 'Category',
      badge: t('badge') || 'Badge',
      gender: t('gender') || 'Gender',
      sort: t('sort') || 'Sort',
      price: t('price') || 'Price range',
      placeholderCategory: t('placeholder.category') || 'All categories',
      placeholderBadge: t('placeholder.badge') || 'Any badge',
      placeholderGender: t('placeholder.gender') || 'All genders',
      placeholderSort: t('placeholder.sort') || 'Default',
      clear: t('clear') || 'Clear filters',
      activeCount: (count: number) => t('activeCount', { count }) || `${count} active`,
    }),
    [t],
  );

  const hasActiveFilters = activeFiltersCount > 0;

  const categoryOptions = useMemo(
    () => availableFilters.categories.map((category) => ({ value: category, label: category })),
    [availableFilters.categories],
  );

  const badgeOptions = useMemo(
    () => availableFilters.badges.map((badge) => ({ value: badge, label: badge })),
    [availableFilters.badges],
  );

  const genderOptions = useMemo(
    () =>
      availableFilters.genders.map((gender) => ({
        value: gender,
        label: t(`genderOptions.${gender}`) || gender.charAt(0).toUpperCase() + gender.slice(1),
      })),
    [availableFilters.genders, t],
  );

  const sortOptions = useMemo(
    () =>
      SORT_OPTION_VALUES.map((value) => ({
        value,
        label: t(`sortOptions.${value}`) || SORT_OPTION_LABELS[value],
      })),
    [t],
  );

  const sliderValue: RangeValue = [
    draftFilters.minPrice ?? availableFilters.priceRange.min,
    draftFilters.maxPrice ?? availableFilters.priceRange.max,
  ];

  return (
    <>
      <CardHeader className="border-border bg-background/70 mx-4 hidden rounded-3xl border p-6 shadow-sm shadow-teal-500/10 backdrop-blur-xl lg:block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.25em] text-teal-600 uppercase dark:text-teal-300">
              {labels.title}
            </p>
            <h2 className="text-foreground mt-2 text-2xl font-semibold">{labels.heading}</h2>
          </div>
          <Badge variant={hasActiveFilters ? 'secondary' : 'outline'}>
            {labels.activeCount(activeFiltersCount)}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">{labels.subtitle}</p>
      </CardHeader>

      <Separator className="border-border lg::block my-4 hidden" />

      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <FilterSelect
            label={labels.category}
            placeholder={labels.placeholderCategory}
            value={draftFilters.category}
            options={categoryOptions}
            onChange={onCategoryChange}
            active={Boolean(draftFilters.category)}
          />
          <FilterSelect
            label={labels.badge}
            placeholder={labels.placeholderBadge}
            value={draftFilters.badge}
            options={badgeOptions}
            onChange={onBadgeChange}
            active={Boolean(draftFilters.badge)}
          />
        </div>

        <FilterSelect
          label={labels.gender}
          placeholder={labels.placeholderGender}
          value={draftFilters.gender}
          options={genderOptions}
          onChange={onGenderChange}
          active={Boolean(draftFilters.gender)}
        />

        <div className="border-border bg-muted/50 rounded-3xl border p-5 shadow-sm shadow-teal-500/10 transition-all duration-200">
          <PriceRangeFilter
            min={availableFilters.priceRange.min}
            max={availableFilters.priceRange.max}
            value={sliderValue}
            onValueChange={onPriceChange}
            active={draftFilters.minPrice !== undefined || draftFilters.maxPrice !== undefined}
            label={labels.price}
          />
        </div>

        <FilterSelect
          label={labels.sort}
          placeholder={labels.placeholderSort}
          value={draftFilters.sort}
          options={sortOptions}
          onChange={onSortChange}
          active={Boolean(draftFilters.sort)}
        />

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={onClear}
            className="border-border bg-background text-foreground hover:bg-muted w-full"
            disabled={!hasActiveFilters}
          >
            {labels.clear}
          </Button>
        </div>
      </CardContent>

      <Separator className="border-border my-4" />
    </>
  );
}

export const FilterPanelContent = React.memo(FilterPanelContentBase);
