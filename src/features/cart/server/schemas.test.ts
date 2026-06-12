import { describe, expect, it } from 'vitest';
import { MergeCartSchema } from './schemas';

const guestCartItem = {
  id: 'guest-item-1',
  productId: 'prod-001',
  name: 'Client Product Name',
  priceSnapshot: 999,
  quantity: 2,
  image: 'https://example.com/client.png',
  stock: 10,
};

describe('MergeCartSchema', () => {
  it('accepts payload without userId', () => {
    const result = MergeCartSchema.safeParse({
      guestCart: [guestCartItem],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        guestCart: [guestCartItem],
      });
    }
  });

  it('does not require client userId and strips it from parsed data', () => {
    const result = MergeCartSchema.safeParse({
      guestCart: [guestCartItem],
      userId: 'client-controlled-user',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        guestCart: [guestCartItem],
      });
      expect('userId' in result.data).toBe(false);
    }
  });
});
