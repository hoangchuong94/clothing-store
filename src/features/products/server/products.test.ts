import { describe, expect, it } from 'vitest';
import { filterProducts } from './products';
import { parseProductFilters } from './schemas';
import type { Product } from '../types';

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'T-Shirt',
    price: 20,
    stock: 10,
    image: '/tshirt.png',
    category: 'tops',
    gender: 'men',
    badge: 'new',
    rating: 4.6,
  },
  {
    id: '2',
    name: 'Sneakers',
    price: 80,
    stock: 5,
    image: '/sneakers.png',
    category: 'shoes',
    gender: 'unisex',
    badge: 'sale',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Dress',
    price: 45,
    stock: 8,
    image: '/dress.png',
    category: 'dresses',
    gender: 'women',
    badge: 'new',
    rating: 4.3,
  },
];

describe('product filtering', () => {
  it('filters products by category and price range', () => {
    const filters = parseProductFilters({ category: 'tops', minPrice: '15', maxPrice: '25' });
    const result = filterProducts(sampleProducts, filters);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('sorts products by rating descending when requested', () => {
    const filters = parseProductFilters({ sort: 'ratingDesc' });
    const result = filterProducts(sampleProducts, filters);

    expect(result[0]?.id).toBe('2');
    expect(result[1]?.id).toBe('1');
  });
});
