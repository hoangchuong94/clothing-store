/** Canonical catalog slugs — must match static `product-source` and cart `productId`. */
export const CANONICAL_PRODUCT_SLUGS = [
  'prod-001',
  'prod-002',
  'prod-003',
  'prod-004',
  'prod-005',
  'prod-006',
  'prod-007',
  'prod-008',
  'prod-009',
  'prod-010',
  'prod-011',
  'prod-012',
  'prod-013',
] as const;

export const CANONICAL_SLUG_PATTERN = /^prod-\d{3}$/;

export const SEED_USER_EMAIL = 'catalog-seed@clothing-store.local';
export const SEED_WAREHOUSE_NAME = 'default';
export const SEED_CATEGORY_SLUG = 'catalog-default';
