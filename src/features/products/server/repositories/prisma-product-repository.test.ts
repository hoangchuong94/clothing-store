import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaProductRepository } from './prisma-product-repository';

vi.mock('@/lib/server/prisma/prisma', () => {
  const findMany = vi.fn();
  const findFirst = vi.fn();

  return {
    default: {
      product: {
        findMany,
        findFirst,
      },
    },
    __mock: {
      findMany,
      findFirst,
    },
  };
});

async function getPrismaMock() {
  const mocked = await vi.importMock('@/lib/server/prisma/prisma');
  return (mocked as unknown as {
    __mock: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
  }).__mock;
}

function productRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'clxyz123',
    slug: 'prod-001',
    name: 'Test Product',
    price: 19.99,
    thumbnail: 'https://example.com/product.png',
    category: { name: 'T-Shirts' },
    variants: [],
    images: [],
    translations: [],
    ...overrides,
  };
}

describe('PrismaProductRepository', () => {
  beforeEach(async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockClear();
    prismaMock.findFirst.mockClear();
  });

  it('returns empty list when no rows are returned', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue([]);

    const repository = new PrismaProductRepository();
    const products = await repository.list();

    expect(products).toEqual([]);
    expect(prismaMock.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
      },
      include: expect.any(Object),
    });
  });

  it('returns active products from list', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue([productRow()]);

    const repository = new PrismaProductRepository();
    const products = await repository.list();

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: 'prod-001',
      name: 'Test Product',
    });
  });

  it('filters soft-deleted products from list queries', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockImplementation((args) => {
      if (args?.where?.deletedAt === null) {
        return Promise.resolve([productRow({ slug: 'prod-active' })]);
      }
      return Promise.resolve([
        productRow({ slug: 'prod-active' }),
        productRow({ slug: 'prod-deleted', deletedAt: new Date() }),
      ]);
    });

    const repository = new PrismaProductRepository();
    const products = await repository.list();

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('prod-active');
    expect(prismaMock.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
      },
      include: expect.any(Object),
    });
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
    prismaMock.findFirst.mockResolvedValue({
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

  it('returns active product by slug', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findFirst.mockResolvedValue(productRow());

    const repository = new PrismaProductRepository();
    const product = await repository.getById('prod-001');

    expect(product).toMatchObject({
      id: 'prod-001',
      name: 'Test Product',
    });
    expect(prismaMock.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        slug: 'prod-001',
        deletedAt: null,
      },
      include: expect.any(Object),
    });
  });

  it('returns null for soft-deleted product lookups', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findFirst.mockResolvedValue(null);

    const repository = new PrismaProductRepository();
    const product = await repository.getById('prod-deleted');

    expect(product).toBeNull();
    expect(prismaMock.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        slug: 'prod-deleted',
        deletedAt: null,
      },
      include: expect.any(Object),
    });
    expect(prismaMock.findFirst).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'prod-deleted',
        deletedAt: null,
      },
      include: expect.any(Object),
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
    prismaMock.findFirst.mockRejectedValue(new Error('query failed'));

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

    expect(prismaMock.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        OR: [
          { id: { in: ['prod-001', 'missing-id'] } },
          { slug: { in: ['prod-001', 'missing-id'] } },
        ],
      },
      include: expect.any(Object),
    });
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: 'prod-001',
      name: 'Batch Product',
    });
  });

  it('filters soft-deleted products from batch queries used by cart and recommendations', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue([productRow({ slug: 'prod-active' })]);

    const repository = new PrismaProductRepository();
    const products = await repository.getByIds(['prod-active', 'prod-deleted']);

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('prod-active');
    expect(prismaMock.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        OR: [
          { id: { in: ['prod-active', 'prod-deleted'] } },
          { slug: { in: ['prod-active', 'prod-deleted'] } },
        ],
      },
      include: expect.any(Object),
    });
  });
});
