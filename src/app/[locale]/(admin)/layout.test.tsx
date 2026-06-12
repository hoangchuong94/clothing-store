import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.hoisted(() => vi.fn());
const getLocaleMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/auth/server/auth-config', () => ({
  auth: authMock,
}));

vi.mock('next-intl/server', () => ({
  getLocale: getLocaleMock,
}));

vi.mock('@/i18n/navigation', () => ({
  redirect: redirectMock,
}));

import DashboardLayout from './layout';

describe('DashboardLayout authorization', () => {
  beforeEach(() => {
    authMock.mockReset();
    getLocaleMock.mockReset();
    redirectMock.mockReset();
    getLocaleMock.mockResolvedValue('vi');
    redirectMock.mockImplementation((target) => {
      throw Object.assign(new Error('NEXT_REDIRECT'), { target });
    });
  });

  it('allows ACTIVE admin sessions returned by auth()', async () => {
    authMock.mockResolvedValue({
      user: {
        id: 'admin-1',
        role: 'ADMIN',
      },
    });

    await expect(DashboardLayout({ children: 'Dashboard' })).resolves.toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('redirects invalidated existing sessions to sign in', async () => {
    authMock.mockResolvedValue({});

    await expect(DashboardLayout({ children: 'Dashboard' })).rejects.toThrow('NEXT_REDIRECT');
    expect(redirectMock).toHaveBeenCalledWith({
      href: '/signin',
      locale: 'vi',
    });
  });

  it('redirects authenticated non-admin users to forbidden', async () => {
    authMock.mockResolvedValue({
      user: {
        id: 'user-1',
        role: 'CUSTOMER',
      },
    });

    await expect(DashboardLayout({ children: 'Dashboard' })).rejects.toThrow('NEXT_REDIRECT');
    expect(redirectMock).toHaveBeenCalledWith({
      href: '/forbidden',
      locale: 'vi',
    });
  });
});
