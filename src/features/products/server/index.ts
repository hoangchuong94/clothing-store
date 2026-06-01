export {
  extractAvailableFilters,
  filterProducts,
  getFeaturedProducts,
  getNewArrivalsProducts,
  getProducts,
} from './products';

export { checkStock, getAllProducts, getProductById, getProducts as getProductsByIds } from './data';

export { parseProductFilters } from './schemas';
export type { ProductFilters } from './schemas';

export { getRepositoryHealth } from './repositories/create-product-repository';
