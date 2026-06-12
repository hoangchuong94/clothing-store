import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.hoisted(() => vi.fn());

vi.mock('./auth-config', () => ({
  auth: authMock,
}));

import { getCurrentUser, getCurrentUserSession } from './session';

describe('server session helpers', () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it('returns the current user for an active session', async () => {
    authMock.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        isEmailVerified: true,
      },
    });

    await expect(getCurrentUser()).resolves.toEqual({
      userId: 'user-1',
      email: 'user@example.com',
      name: 'User',
      isEmailVerified: true,
    });
    await expect(getCurrentUserSession()).resolves.toEqual({
      isAuthenticated: true,
      userId: 'user-1',
    });
  });

  it('treats invalidated existing sessions as unauthenticated', async () => {
    authMock.mockResolvedValue({});

    await expect(getCurrentUser()).resolves.toBeNull();
    await expect(getCurrentUserSession()).resolves.toEqual({
      isAuthenticated: false,
      userId: undefined,
    });
  });
});
