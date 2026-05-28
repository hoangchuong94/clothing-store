import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaProductRepository } from './prisma-product-repository';

vi.mock('@/lib/server/prisma/prisma', () => {
  const findMany = vi.fn();
  const findUnique = vi.fn();

  return {
    default: {
      product: {
        findMany,
        findUnique,
      },
    },
    __mock: {
      findMany,
      findUnique,
    },
  };
});

async function getPrismaMock() {
  const mocked = await vi.importMock('@/lib/server/prisma/prisma');
  return (mocked as unknown as {
    __mock: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  }).__mock;
}

describe('PrismaProductRepository', () => {
  beforeEach(async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockClear();
    prismaMock.findUnique.mockClear();
  });

  it('returns empty list when no rows are returned', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue([]);

    const repository = new PrismaProductRepository();
    const products = await repository.list();

    expect(products).toEqual([]);
    expect(prismaMock.findMany).toHaveBeenCalledOnce();
  });

  it('maps invalid rows gracefully and returns default shape', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue([
      {
        id: 'invalid-001',
        slug: 'invalid-001',
        price: null,
        thumbnail: null,
        category: null,
        variants: null,
        images: [],
        translations: [],
      },
    ]);

    const repository = new PrismaProductRepository();
    const products = await repository.list();

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: 'invalid-001',
      name: '',
      price: 0,
      stock: 0,
      image: '',
      category: '',
    });
  });

  it('handles missing inventory and computes stock as zero', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue([
      {
        id: 'no-stock-001',
        slug: 'no-stock-001',
        name: 'No Inventory Product',
        price: 15.5,
        thumbnail: null,
        category: { name: 'Misc' },
        variants: [{ id: 'variant-1', slug: 'v1', inventory: null }],
        images: [],
        translations: [],
      },
    ]);

    const repository = new PrismaProductRepository();
    const products = await repository.list();

    expect(products[0]).toMatchObject({
      id: 'no-stock-001',
      stock: 0,
      image: '',
      category: 'Misc',
    });
  });

  it('converts Decimal-like values to numbers for price and originalPrice', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue([
      {
        id: 'decimal-001',
        slug: 'decimal-001',
        name: 'Decimal Product',
        price: { toNumber: () => 12.34 },
        maxPrice: { toNumber: () => 24.68 },
        thumbnail: null,
        category: { name: 'Digits' },
        variants: [],
        images: [],
        translations: [],
      },
    ]);

    const repository = new PrismaProductRepository();
    const products = await repository.list();

    expect(products[0]).toMatchObject({
      price: 12.34,
      originalPrice: 24.68,
    });
  });

  it('uses alternate image source when thumbnail is null and image array is present', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findUnique.mockResolvedValue({
      id: 'image-001',
      slug: 'image-001',
      name: 'Fallback Image Product',
      price: 33.33,
      thumbnail: null,
      images: [{ url: 'https://example.com/fallback.png' }],
      category: { name: 'Accessories' },
      variants: [],
      translations: [],
    });

    const repository = new PrismaProductRepository();
    const product = await repository.getById('image-001');

    expect(product).toMatchObject({
      id: 'image-001',
      image: 'https://example.com/fallback.png',
    });
  });

  it('throws when Prisma list query fails', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockRejectedValue(new Error('database unavailable'));

    const repository = new PrismaProductRepository();
    await expect(repository.list()).rejects.toThrow('database unavailable');
  });

  it('throws when Prisma getById query fails', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findUnique.mockRejectedValue(new Error('query failed'));

    const repository = new PrismaProductRepository();
    await expect(repository.getById('does-not-matter')).rejects.toThrow('query failed');
  });

  it('resolves batch cart ids by slug and returns canonical Product.id', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue([
      {
        id: 'clxyz123',
        slug: 'prod-001',
        name: 'Batch Product',
        price: 19.99,
        thumbnail: 'https://example.com/batch.png',
        category: { name: 'T-Shirts' },
        variants: [],
        images: [],
        translations: [],
      },
    ]);

    const repository = new PrismaProductRepository();
    const products = await repository.getByIds(['prod-001', 'missing-id']);

    expect(prismaMock.findMany).toHaveBeenCalledOnce();
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: 'prod-001',
      name: 'Batch Product',
    });
  });
});
