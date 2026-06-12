import prisma from '@/lib/server/prisma/prisma';
import type {
  Product as AppProduct,
  ProductVariant as AppVariant,
} from '@/features/products/types';
import type { ProductRepository } from './product-repository';

type DecimalLike = { toNumber: () => number };
type PrismaInventoryRow = { quantity: number | null };
type PrismaVariantRow = {
  id: string;
  slug: string | null;
  sku: string | null;
  inventory: PrismaInventoryRow[] | null;
};
type PrismaProductRow = {
  id: string;
  slug: string;
  name: string | null;
  price: unknown;
  maxPrice?: unknown;
  thumbnail: string | null;
  images?: Array<{ url: string }>;
  category?: { name: string } | null;
  isNew?: boolean;
  isFeatured?: boolean;
  variants?: PrismaVariantRow[] | null;
  translations?: Array<{ name: string | null }>;
};

function decimalToNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof (value as DecimalLike).toNumber === 'function'
  ) {
    return (value as DecimalLike).toNumber();
  }
  return Number(value);
}

function mapVariant(v: PrismaVariantRow): AppVariant {
  return {
    id: v.id,
    name: v.slug ?? v.sku ?? 'variant',
    values: v.sku ? [v.sku] : v.slug ? [v.slug] : [],
  };
}

function mapProduct(p: PrismaProductRow): AppProduct {
  const slug = p.slug;
  if (!slug || typeof slug !== 'string') {
    throw new Error(`Product row missing slug (db id=${p.id ?? 'unknown'})`);
  }

  const variants: AppVariant[] = (p.variants ?? []).map(mapVariant);

  const stock = (p.variants ?? [])
    .flatMap((v) => (v.inventory ?? []).map((i) => i.quantity ?? 0))
    .reduce((sum, quantity) => sum + quantity, 0);

  return {
    // Exposed catalog/cart id is always canonical slug — never DB cuid.
    id: slug,
    name: p.name ?? p.translations?.[0]?.name ?? '',
    price: decimalToNumber(p.price),
    originalPrice: p.maxPrice ? decimalToNumber(p.maxPrice) : undefined,
    stock,
    image: p.thumbnail ?? p.images?.[0]?.url ?? '',
    category: p.category?.name ?? '',
    gender: undefined,
    badge: p.isNew ? 'NEW' : p.isFeatured ? 'FEATURED' : undefined,
    rating: undefined,
    reviews: undefined,
    variants,
  };
}

const productInclude = {
  category: true,
  variants: { include: { inventory: true } },
  images: true,
  translations: true,
} as const;

export class PrismaProductRepository implements ProductRepository {
  async list(): Promise<AppProduct[]> {
    try {
      const rows = await prisma.product.findMany({
        where: {
          deletedAt: null,
        },
        include: productInclude,
      });
      try {
        // lazy import to avoid client bundle leakage
        const { recordRead } = await import('@/lib/server/metrics/product-repo-metrics');
        recordRead('PRISMA', { operation: 'list', route: 'unknown' });
      } catch {}
      return rows.map((row) => mapProduct(row as unknown as PrismaProductRow));
    } catch (err) {
      try {
        const { recordFailure } = await import('@/lib/server/metrics/product-repo-metrics');
        if (err instanceof Error)
          recordFailure('PRISMA', err, { operation: 'list', route: 'unknown' });
      } catch {}
      throw err;
    }
  }

  async getById(productId: string): Promise<AppProduct | null> {
    try {
      let p = await prisma.product.findFirst({
        where: {
          slug: productId,
          deletedAt: null,
        },
        include: productInclude,
      });
      if (!p) {
        p = await prisma.product.findFirst({
          where: {
            id: productId,
            deletedAt: null,
          },
          include: productInclude,
        });
      }
      try {
        const { recordRead } = await import('@/lib/server/metrics/product-repo-metrics');
        recordRead('PRISMA', { operation: 'getById', route: 'unknown' });
      } catch {}
      if (!p) return null;
      return mapProduct(p as unknown as PrismaProductRow);
    } catch (err) {
      try {
        const { recordFailure } = await import('@/lib/server/metrics/product-repo-metrics');
        if (err instanceof Error)
          recordFailure('PRISMA', err, { operation: 'getById', route: 'unknown' });
      } catch {}
      throw err;
    }
  }

  async getByIds(productIds: string[]): Promise<AppProduct[]> {
    const uniqueIds = [...new Set(productIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return [];
    }

    try {
      const rows = await prisma.product.findMany({
        where: {
          deletedAt: null,
          OR: [{ id: { in: uniqueIds } }, { slug: { in: uniqueIds } }],
        },
        include: productInclude,
      });

      try {
        const { recordRead } = await import('@/lib/server/metrics/product-repo-metrics');
        recordRead('PRISMA', { operation: 'getByIds', route: 'unknown' });
      } catch {}

      const results: AppProduct[] = [];
      for (const requestedId of uniqueIds) {
        const row = rows.find((r) => r.slug === requestedId || r.id === requestedId);
        if (row) {
          results.push(mapProduct(row as unknown as PrismaProductRow));
        }
      }
      return results;
    } catch (err) {
      try {
        const { recordFailure } = await import('@/lib/server/metrics/product-repo-metrics');
        if (err instanceof Error)
          recordFailure('PRISMA', err, { operation: 'getByIds', route: 'unknown' });
      } catch {}
      throw err;
    }
  }
}
