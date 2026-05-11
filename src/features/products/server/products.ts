import { Product, AvailableProductFilters } from '../types';
import { getAllProducts } from './data';
import { parseProductFilters, ProductFilters } from './schemas';

export { getAllProducts } from './data';

export async function getProducts(searchParams?: Record<string, string | string[] | undefined>) {
  const filters = parseProductFilters(searchParams ?? {});
  const products = await getAllProducts();
  return filterProducts(products, filters);
}

export function filterProducts(products: Product[], filters: ProductFilters) {
  return products
    .filter((product) => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.badge && product.badge !== filters.badge) {
        return false;
      }
      if (filters.gender && product.gender !== filters.gender) {
        return false;
      }
      if (typeof filters.minPrice === 'number' && product.price < filters.minPrice) {
        return false;
      }
      if (typeof filters.maxPrice === 'number' && product.price > filters.maxPrice) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'ratingDesc':
          return (b.rating ?? 0) - (a.rating ?? 0);
        default:
          return 0;
      }
    });
}

export function extractAvailableFilters(products: Product[]): AvailableProductFilters {
  const categories = Array.from(new Set(products.map((product) => product.category))).sort();
  const badges = Array.from(
    new Set(products.map((product) => product.badge).filter(Boolean) as string[]),
  ).sort();
  const genders = Array.from(
    new Set(
      products.map((product) => product.gender).filter(Boolean) as Array<
        'men' | 'women' | 'unisex'
      >,
    ),
  ).sort();
  const prices = products.map((product) => product.price);

  return {
    categories,
    badges,
    genders,
    priceRange: {
      min: prices.length ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length ? Math.ceil(Math.max(...prices)) : 0,
    },
  };
}
