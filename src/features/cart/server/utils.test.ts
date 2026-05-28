import { describe, expect, it } from 'vitest';
import { mergeCartsLogic } from './utils';
import type { CartItem } from '../types';

describe('mergeCartsLogic', () => {
  const products = new Map([
    [
      'prod-1',
      {
        name: 'T-Shirt',
        price: 24.99,
        image: '/images/tshirt.png',
      },
    ],
    [
      'prod-2',
      {
        name: 'Cap',
        price: 12.5,
        image: '/images/cap.png',
      },
    ],
  ]);

  it('merges duplicate cart items and resolves server product data', () => {
    const userCart: CartItem[] = [
      {
        id: 'user-1',
        productId: 'prod-1',
        name: 'Old Name',
        priceSnapshot: 19.99,
        quantity: 1,
        stock: 3,
        image: '/old.png',
      },
    ];

    const guestCart: CartItem[] = [
      {
        id: 'guest-1',
        productId: 'prod-1',
        name: 'Client Name',
        priceSnapshot: 19.99,
        quantity: 2,
        stock: 3,
        image: '/client.png',
      },
    ];

    const merged = mergeCartsLogic(userCart, guestCart, products);

    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(3);
    expect(merged[0].priceSnapshot).toBe(24.99);
    expect(merged[0].name).toBe('T-Shirt');
    expect(merged[0].image).toBe('/images/tshirt.png');
  });

  it('skips guest items that do not match server products and preserves unmatched user items', () => {
    const userCart: CartItem[] = [
      {
        id: 'user-2',
        productId: 'prod-2',
        name: 'Cap',
        priceSnapshot: 12.5,
        quantity: 1,
        stock: 10,
        image: '/images/cap.png',
      },
    ];

    const guestCart: CartItem[] = [
      {
        id: 'guest-bad',
        productId: 'prod-missing',
        name: 'Broken',
        priceSnapshot: 5,
        quantity: 1,
        stock: 1,
        image: '/broken.png',
      },
    ];

    const merged = mergeCartsLogic(userCart, guestCart, products);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      productId: 'prod-2',
      quantity: 1,
      name: 'Cap',
    });
  });
});
