import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StaticProductRepository } from './static-product-repository';
import { PRODUCTS } from '../facades/product-source';
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

async function getPrismaMock() {
  const mocked = await vi.importMock('@/lib/server/prisma/prisma');
  return (mocked as { default: { product: typeof prismaMock } }).default.product;
}

function normalize(value: unknown) {
  return value === undefined ? null : value;
}

function compareField(
  field: string,
  staticValue: unknown,
  prismaValue: unknown,
): { matched: boolean; classification: 'SAFE' | 'WARNING' | 'BLOCKER'; message?: string } {
  const a = normalize(staticValue);
  const b = normalize(prismaValue);

  if (a === b) {
    return { matched: true, classification: 'SAFE' };
  }

  if (field === 'badge') {
    return {
      matched: false,
      classification: 'WARNING',
      message: `badge mismatch: static=${JSON.stringify(a)} prisma=${JSON.stringify(b)}`,
    };
  }

  if (field === 'variantCount') {
    return {
      matched: false,
      classification: 'WARNING',
      message: `variantCount mismatch: static=${a} prisma=${b}`,
    };
  }

  return {
    matched: false,
    classification: 'BLOCKER',
    message: `${field} mismatch: static=${JSON.stringify(a)} prisma=${JSON.stringify(b)}`,
  };
}

function buildPrismaRow(product: Product) {
  const variants = (product.variants ?? []).map((variant, index) => ({
    id: variant.id,
    slug: variant.values[0] ?? variant.id,
    sku: null,
    inventory: [
      {
        quantity: index === 0 ? product.stock : 0,
      },
    ],
  }));

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    maxPrice: product.originalPrice ?? null,
    thumbnail: product.image,
    images: [],
    category: product.category ? { name: product.category } : null,
    slug: product.id,
    isNew: product.badge === 'NEW',
    isFeatured: product.badge === 'FEATURED',
    variants,
    translations: [],
  };
}

function getBusinessSnapshot(product: Product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    image: product.image,
    category: product.category,
    badge: product.badge ?? null,
    variantCount: product.variants?.length ?? 0,
  };
}

function sortById(products: Array<Product>) {
  return [...products].sort((a, b) => a.id.localeCompare(b.id));
}

describe('product repository equivalence', () => {
  beforeEach(async () => {
    const mock = await getPrismaMock();
    mock.findMany.mockClear();
    mock.findUnique.mockClear();
  });

  it('compares list() output between StaticProductRepository and PrismaProductRepository', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findMany.mockResolvedValue(PRODUCTS.map(buildPrismaRow));

    const { PrismaProductRepository } = await import('./prisma-product-repository');
    const staticRepo = new StaticProductRepository();
    const prismaRepo = new PrismaProductRepository();

    const [staticProducts, prismaProducts] = await Promise.all([
      staticRepo.list(),
      prismaRepo.list(),
    ]);

    expect(staticProducts.length).toBeGreaterThan(0);
    expect(prismaMock.findMany).toHaveBeenCalledOnce();

    const sortedStatic = sortById(staticProducts);
    const sortedPrisma = sortById(prismaProducts);

    const fields = [
      'id',
      'name',
      'price',
      'stock',
      'image',
      'category',
      'badge',
      'variantCount',
    ] as const;
    const report = {
      productsCompared: 0,
      fieldsCompared: 0,
      matches: 0,
      warnings: 0,
      blockers: 0,
      details: [] as Array<{
        productId: string;
        field: string;
        classification: string;
        message: string;
      }>,
    };

    const productCount = Math.min(sortedStatic.length, sortedPrisma.length);
    report.productsCompared = productCount;

    for (let i = 0; i < productCount; i += 1) {
      const left = sortedStatic[i];
      const right = sortedPrisma[i];
      const snapshotA = getBusinessSnapshot(left);
      const snapshotB = getBusinessSnapshot(right);

      fields.forEach((field) => {
        const result = compareField(field, snapshotA[field], snapshotB[field]);
        report.fieldsCompared += 1;
        if (result.matched) {
          report.matches += 1;
        } else if (result.classification === 'WARNING') {
          report.warnings += 1;
          report.details.push({
            productId: left.id,
            field,
            classification: 'WARNING',
            message: result.message ?? '',
          });
        } else {
          report.blockers += 1;
          report.details.push({
            productId: left.id,
            field,
            classification: 'BLOCKER',
            message: result.message ?? '',
          });
        }
      });
    }

    console.info(
      'Prisma vs Static product list comparison report:',
      JSON.stringify(report, null, 2),
    );

    expect(report.blockers).toBeLessThanOrEqual(1);
    expect(report.matches / report.fieldsCompared).toBeGreaterThanOrEqual(0.9);
  });

  it('compares getById() output for static product IDs', async () => {
    const prismaMock = await getPrismaMock();
    prismaMock.findUnique.mockImplementation(async ({ where }: { where: { id?: string; slug?: string } }) => {
      const productId = where.id ?? where.slug;
      const product = PRODUCTS.find((p) => p.id === productId);
      return product ? buildPrismaRow(product) : null;
    });

    const { PrismaProductRepository } = await import('./prisma-product-repository');
    const staticRepo = new StaticProductRepository();
    const prismaRepo = new PrismaProductRepository();

    const samples = PRODUCTS.slice(0, Math.min(PRODUCTS.length, 8));
    const report = {
      productsCompared: samples.length,
      fieldsCompared: 0,
      matches: 0,
      warnings: 0,
      blockers: 0,
      details: [] as Array<{
        productId: string;
        field: string;
        classification: string;
        message: string;
      }>,
    };

    for (const product of samples) {
      const [staticProduct, prismaProduct] = await Promise.all([
        staticRepo.getById(product.id),
        prismaRepo.getById(product.id),
      ]);

      expect(staticProduct).not.toBeNull();
      expect(prismaProduct).not.toBeNull();
      if (!staticProduct || !prismaProduct) continue;

      const snapshotA = getBusinessSnapshot(staticProduct);
      const snapshotB = getBusinessSnapshot(prismaProduct);
      const fields = [
        'id',
        'name',
        'price',
        'stock',
        'image',
        'category',
        'badge',
        'variantCount',
      ] as const;

      fields.forEach((field) => {
        const result = compareField(field, snapshotA[field], snapshotB[field]);
        report.fieldsCompared += 1;
        if (result.matched) {
          report.matches += 1;
        } else if (result.classification === 'WARNING') {
          report.warnings += 1;
          report.details.push({
            productId: product.id,
            field,
            classification: 'WARNING',
            message: result.message ?? '',
          });
        } else {
          report.blockers += 1;
          report.details.push({
            productId: product.id,
            field,
            classification: 'BLOCKER',
            message: result.message ?? '',
          });
        }
      });
    }

    console.info(
      'Prisma vs Static product getById comparison report:',
      JSON.stringify(report, null, 2),
    );

    expect(report.blockers).toBeLessThanOrEqual(1);
    expect(report.matches / report.fieldsCompared).toBeGreaterThanOrEqual(0.9);
  });
});
