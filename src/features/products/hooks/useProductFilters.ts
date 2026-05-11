'use client';

import { useMemo, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ProductFilterSchema, ProductFilters } from '../server/schemas';

function buildSearchParams(filters: ProductFilters) {
  const params = new URLSearchParams();

  if (filters.category) params.set('category', filters.category);
  if (filters.badge) params.set('badge', filters.badge);
  if (filters.gender) params.set('gender', filters.gender);
  if (typeof filters.minPrice === 'number') params.set('minPrice', String(filters.minPrice));
  if (typeof filters.maxPrice === 'number') params.set('maxPrice', String(filters.maxPrice));
  if (filters.sort) params.set('sort', filters.sort);

  return params.toString();
}

export function useProductFilters(initialFilters: ProductFilters = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<ProductFilters>(() => {
    const values = {
      category: searchParams.get('category') ?? undefined,
      badge: searchParams.get('badge') ?? undefined,
      gender: (searchParams.get('gender') as ProductFilters['gender']) ?? undefined,
      minPrice: searchParams.get('minPrice') ?? undefined,
      maxPrice: searchParams.get('maxPrice') ?? undefined,
      sort: (searchParams.get('sort') as ProductFilters['sort']) ?? undefined,
    };

    try {
      return ProductFilterSchema.parse(values);
    } catch {
      return initialFilters;
    }
  }, [searchParams, initialFilters]);

  const setFilters = useCallback(
    (nextFilters: Partial<ProductFilters>) => {
      const next = {
        ...filters,
        ...nextFilters,
      };

      const search = buildSearchParams(next);
      const url = search ? `${pathname}?${search}` : pathname;

      router.replace(url, { scroll: false });
    },
    [filters, router, pathname],
  );

  return {
    filters,
    setFilters,
  };
}
