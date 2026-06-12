import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '@/features/cart/types';

const authMock = vi.hoisted(() => ({
  getCurrentUserSession: vi.fn(),
}));

const dbMock = vi.hoisted(() => ({
  getProduct: vi.fn(),
  getProducts: vi.fn(),
  getUserCart: vi.fn(),
  saveUserCart: vi.fn(),
  deleteUserCart: vi.fn(),
  checkStock: vi.fn(),
}));

vi.mock('@/lib/server/actions/auth', () => authMock);

vi.mock('./db', () => dbMock);

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'generated-cart-item-id'),
}));

import { mergeCart } from './actions';

const guestItem: CartItem = {
  id: 'guest-item-1',
  productId: 'prod-001',
  name: 'Client Product Name',
  priceSnapshot: 999,
  quantity: 2,
  image: 'https://example.com/client.png',
  stock: 10,
};

const serverProduct = {
  id: 'prod-001',
  name: 'Server Product Name',
  price: 25,
  image: 'https://example.com/server.png',
};

describe('cart server actions', () => {
  beforeEach(() => {
    authMock.getCurrentUserSession.mockReset();
    dbMock.getProduct.mockReset();
    dbMock.getProducts.mockReset();
    dbMock.getUserCart.mockReset();
    dbMock.saveUserCart.mockReset();
    dbMock.deleteUserCart.mockReset();
    dbMock.checkStock.mockReset();

    authMock.getCurrentUserSession.mockResolvedValue({
      isAuthenticated: true,
      userId: 'session-user',
    });
    dbMock.getUserCart.mockResolvedValue(null);
    dbMock.getProducts.mockResolvedValue([serverProduct]);
    dbMock.saveUserCart.mockResolvedValue(undefined);
  });

  it('merges guest cart using the session user id', async () => {
    const result = await mergeCart({
      guestCart: [guestItem],
    });

    expect(result.success).toBe(true);
    expect(dbMock.getUserCart).toHaveBeenCalledWith('session-user');
    expect(dbMock.saveUserCart).toHaveBeenCalledWith(
      'session-user',
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: 'generated-cart-item-id',
            productId: 'prod-001',
            name: 'Server Product Name',
            priceSnapshot: 25,
            image: 'https://example.com/server.png',
            quantity: 2,
          }),
        ],
      }),
    );
  });

  it('ignores client userId and still saves against the session user id', async () => {
    const result = await mergeCart({
      guestCart: [guestItem],
      userId: 'attacker-controlled-user',
    });

    expect(result.success).toBe(true);
    expect(dbMock.getUserCart).toHaveBeenCalledWith('session-user');
    expect(dbMock.getUserCart).not.toHaveBeenCalledWith('attacker-controlled-user');
    expect(dbMock.saveUserCart).toHaveBeenCalledWith('session-user', expect.any(Object));
    expect(dbMock.saveUserCart).not.toHaveBeenCalledWith(
      'attacker-controlled-user',
      expect.any(Object),
    );
  });

  it('keeps unauthenticated merge behavior unchanged', async () => {
    authMock.getCurrentUserSession.mockResolvedValue({
      isAuthenticated: false,
      userId: undefined,
    });

    const result = await mergeCart({
      guestCart: [guestItem],
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: 'NOT_AUTHENTICATED',
      },
    });
    expect(dbMock.getUserCart).not.toHaveBeenCalled();
    expect(dbMock.saveUserCart).not.toHaveBeenCalled();
  });
});
