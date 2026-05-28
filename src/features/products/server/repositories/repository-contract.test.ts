import { describe, expect, it, vi, beforeEach } from 'vitest';
import { StaticProductRepository } from './static-product-repository';
import type { Product } from '@/features/products/types';

const prismaMock = {
  findMany: vi.fn(),
  findUnique: vi.fn(),
} as const;

vi.mock('@/lib/server/prisma/prisma', () => ({
  default: {
    product: prismaMock,
  },
}));

function assertProductShape(product: Product) {
  expect(product).toMatchObject({
    id: expect.any(String),
    name: expect.any(String),
    price: expect.any(Number),
    stock: expect.any(Number),
    image: expect.any(String),
    category: expect.any(String),
  });

  if (product.originalPrice !== undefined) {
    expect(product.originalPrice).toEqual(expect.any(Number));
  }
  if (product.gender !== undefined) {
    expect(['men', 'women', 'unisex']).toContain(product.gender);
  }
  if (product.badge !== undefined) {
    expect(typeof product.badge).toBe('string');
  }
  if (product.rating !== undefined) {
    expect(typeof product.rating).toBe('number');
  }
  if (product.reviews !== undefined) {
    expect(typeof product.reviews).toBe('number');
  }
  if (product.variants !== undefined) {
    expect(Array.isArray(product.variants)).toBe(true);
    product.variants.forEach((variant) => {
      expect(variant).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        values: expect.any(Array),
      });
    });
  }
}

const sampleRow = {
  id: 'db-001',
  slug: 'db-001',
  name: 'Database Product',
  price: 49.99,
  maxPrice: 79.99,
  thumbnail: 'https://example.com/image.png',
  images: [{ url: 'https://example.com/image-fallback.png' }],
  category: { name: 'Caps' },
  isNew: true,
  isFeatured: false,
  variants: [
    {
      id: 'variant-1',
      slug: 'variant-1',
      sku: 'SKU-1',
      inventory: [{ quantity: 3 }],
    },
  ],
  translations: [{ name: 'Translated Product' }],
};

describe('product repository contract', () => {
  beforeEach(() => {
    prismaMock.findMany.mockClear();
    prismaMock.findUnique.mockClear();
  });

  it('returns a valid list shape for StaticProductRepository and PrismaProductRepository', async () => {
    prismaMock.findMany.mockResolvedValue([sampleRow]);

    const { PrismaProductRepository } = await import('./prisma-product-repository');
    const staticRepo = new StaticProductRepository();
    const prismaRepo = new PrismaProductRepository();

    const [staticProducts, prismaProducts] = await Promise.all([
      staticRepo.list(),
      prismaRepo.list(),
    ]);

    expect(staticProducts.length).toBeGreaterThan(0);
    staticProducts.forEach(assertProductShape);

    expect(prismaProducts).toHaveLength(1);
    prismaProducts.forEach(assertProductShape);
  });

  it('returns the same shaped product from getById() for both repositories', async () => {
    prismaMock.findUnique.mockResolvedValue(sampleRow);

    const { PrismaProductRepository } = await import('./prisma-product-repository');
    const staticRepo = new StaticProductRepository();
    const prismaRepo = new PrismaProductRepository();

    const [staticProduct, prismaProduct] = await Promise.all([
      staticRepo.getById('prod-001'),
      prismaRepo.getById('db-001'),
    ]);

    expect(staticProduct).not.toBeNull();
    expect(prismaProduct).not.toBeNull();

    if (staticProduct) {
      assertProductShape(staticProduct);
    }

    if (prismaProduct) {
      assertProductShape(prismaProduct);
    }
  });
});
