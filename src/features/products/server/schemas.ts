import { z } from 'zod';

const parseNumber = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}, z.number().nonnegative().optional());

export const ProductFilterSchema = z.object({
  category: z.string().trim().min(1).optional(),
  badge: z.string().trim().min(1).optional(),
  gender: z.enum(['men', 'women', 'unisex']).optional(),
  minPrice: parseNumber,
  maxPrice: parseNumber,
  sort: z.enum(['priceAsc', 'priceDesc', 'ratingDesc']).optional(),
});

export type ProductFilters = z.infer<typeof ProductFilterSchema>;

export function parseProductFilters(searchParams: Record<string, unknown> | URLSearchParams) {
  const rawQuery: Record<string, unknown> = {};

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      rawQuery[key] = value;
    });
  } else {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle string arrays from Next.js searchParams by taking first element
        if (Array.isArray(value)) {
          rawQuery[key] = value[0];
        } else {
          rawQuery[key] = value;
        }
      }
    });
  }

  return ProductFilterSchema.parse(rawQuery);
}
