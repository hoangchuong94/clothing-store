import { Prisma, ProductStatus, UserRole, UserStatus } from '../src/generated/prisma/client';
import prisma from '../src/lib/server/prisma/prisma';
import { PRODUCTS } from '../src/features/products/server/facades/product-source';
import {
  CANONICAL_PRODUCT_SLUGS,
  SEED_CATEGORY_SLUG,
  SEED_USER_EMAIL,
  SEED_WAREHOUSE_NAME,
} from './seed/catalog-constants';

function categorySlugFromName(name: string): string {
  return `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function badgeFlags(badge?: string): { isNew: boolean; isFeatured: boolean } {
  if (badge === 'NEW') return { isNew: true, isFeatured: false };
  if (badge === 'FEATURED' || badge === 'HOT' || badge === 'LIMITED') {
    return { isNew: false, isFeatured: true };
  }
  return { isNew: false, isFeatured: false };
}

async function seedRoles(): Promise<void> {
  const roles = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.STAFF,
    UserRole.SELLER,
    UserRole.CUSTOMER,
  ];

  await Promise.all(
    roles.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log(`Seeded roles: ${roles.join(', ')}`);
}

async function seedCatalogDependencies(): Promise<{
  createdById: string;
  categoryIdsByName: Map<string, string>;
  warehouseId: string;
}> {
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: UserRole.ADMIN },
  });

  const seedUser = await prisma.user.upsert({
    where: { email: SEED_USER_EMAIL },
    update: { name: 'Catalog Seed User', status: UserStatus.ACTIVE },
    create: {
      email: SEED_USER_EMAIL,
      name: 'Catalog Seed User',
      status: UserStatus.ACTIVE,
      roleId: adminRole.id,
    },
  });

  const fallbackCategory = await prisma.category.upsert({
    where: { slug: SEED_CATEGORY_SLUG },
    update: { name: 'Catalog Default' },
    create: {
      name: 'Catalog Default',
      slug: SEED_CATEGORY_SLUG,
    },
  });

  const categoryIdsByName = new Map<string, string>();
  categoryIdsByName.set('Catalog Default', fallbackCategory.id);

  const uniqueCategoryNames = [...new Set(PRODUCTS.map((p) => p.category))];
  for (const name of uniqueCategoryNames) {
    const slug = categorySlugFromName(name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    categoryIdsByName.set(name, category.id);
  }

  const warehouse = await prisma.warehouse.upsert({
    where: { name: SEED_WAREHOUSE_NAME },
    update: { location: 'Seed warehouse' },
    create: {
      name: SEED_WAREHOUSE_NAME,
      location: 'Seed warehouse',
    },
  });

  return {
    createdById: seedUser.id,
    categoryIdsByName,
    warehouseId: warehouse.id,
  };
}

async function seedProducts(
  createdById: string,
  categoryIdsByName: Map<string, string>,
  warehouseId: string,
): Promise<void> {
  for (const product of PRODUCTS) {
    if (!CANONICAL_PRODUCT_SLUGS.includes(product.id as (typeof CANONICAL_PRODUCT_SLUGS)[number])) {
      throw new Error(`Static product id "${product.id}" is not in canonical slug list`);
    }

    const slug = product.id;
    const categoryId =
      categoryIdsByName.get(product.category) ?? categoryIdsByName.get('Catalog Default');
    if (!categoryId) {
      throw new Error(`Missing category for product ${slug}`);
    }

    const { isNew, isFeatured } = badgeFlags(product.badge);
    const description = `${product.name} — seeded catalog product for repository migration.`;
    const metaDescription = description.slice(0, 500);
    const price = new Prisma.Decimal(product.price);
    const maxPrice =
      product.originalPrice != null ? new Prisma.Decimal(product.originalPrice) : null;

    const dbProduct = await prisma.product.upsert({
      where: { slug },
      update: {
        name: product.name,
        title: product.name,
        sku: `SKU-${slug}`,
        description,
        price,
        maxPrice,
        thumbnail: product.image,
        metaTitle: product.name,
        metaDescription,
        status: ProductStatus.ACTIVE,
        available: true,
        isNew,
        isFeatured,
        categoryId,
        createdById,
        deletedAt: null,
      },
      create: {
        slug,
        name: product.name,
        title: product.name,
        sku: `SKU-${slug}`,
        description,
        price,
        maxPrice,
        thumbnail: product.image,
        metaTitle: product.name,
        metaDescription,
        status: ProductStatus.ACTIVE,
        available: true,
        isNew,
        isFeatured,
        categoryId,
        createdById,
      },
    });

    const variantSku = `VAR-${slug}`;
    const variant = await prisma.productVariant.upsert({
      where: { sku: variantSku },
      update: {
        productId: dbProduct.id,
        slug: `${slug}-default`,
        price,
        available: product.stock > 0,
      },
      create: {
        productId: dbProduct.id,
        sku: variantSku,
        slug: `${slug}-default`,
        price,
        available: product.stock > 0,
      },
    });

    await prisma.inventory.upsert({
      where: {
        variantId_warehouseId: {
          variantId: variant.id,
          warehouseId,
        },
      },
      update: {
        quantity: product.stock,
      },
      create: {
        variantId: variant.id,
        warehouseId,
        quantity: product.stock,
      },
    });
  }

  console.log(`Seeded ${PRODUCTS.length} canonical products (${CANONICAL_PRODUCT_SLUGS.join(', ')})`);
}

async function main(): Promise<void> {
  await seedRoles();
  const deps = await seedCatalogDependencies();
  await seedProducts(deps.createdById, deps.categoryIdsByName, deps.warehouseId);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
