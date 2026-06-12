import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.hoisted(() => vi.fn());
const metricsMock = vi.hoisted(() => ({
  getReport: vi.fn(),
}));
const repositoryMock = vi.hoisted(() => ({
  getRepositoryHealth: vi.fn(),
}));

vi.mock('@/features/auth/server/auth-config', () => ({
  auth: authMock,
}));

vi.mock('@/lib/server/metrics/product-repo-metrics', () => metricsMock);

vi.mock('@/features/products/server/repositories/create-product-repository', () => repositoryMock);

import { GET } from './route';

const enabledReport = {
  enabled: true,
  totals: {
    selections: 1,
    prisma_reads: 2,
    static_reads: 3,
    fallback_reads: 0,
    failures: 0,
  },
  byRepo: {
    STATIC: { reads: 3, failures: 0, selections: 1 },
    PRISMA: { reads: 2, failures: 0, selections: 0 },
    UNKNOWN: { reads: 0, failures: 0, selections: 0 },
  },
  lastErrors: [],
};

const health = {
  mode: 'STATIC',
  activeRepository: 'STATIC',
};

function sessionWithRole(role: string) {
  return {
    user: {
      id: 'user-1',
      role,
    },
  };
}

describe('GET /api/internal/runtime/product-repository', () => {
  beforeEach(() => {
    authMock.mockReset();
    metricsMock.getReport.mockReset();
    repositoryMock.getRepositoryHealth.mockReset();

    authMock.mockResolvedValue(sessionWithRole('ADMIN'));
    metricsMock.getReport.mockReturnValue(enabledReport);
    repositoryMock.getRepositoryHealth.mockReturnValue(health);
  });

  it('rejects requests with no session', async () => {
    authMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(metricsMock.getReport).not.toHaveBeenCalled();
    expect(repositoryMock.getRepositoryHealth).not.toHaveBeenCalled();
  });

  it('rejects CUSTOMER sessions', async () => {
    authMock.mockResolvedValue(sessionWithRole('CUSTOMER'));

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'forbidden' });
    expect(metricsMock.getReport).not.toHaveBeenCalled();
    expect(repositoryMock.getRepositoryHealth).not.toHaveBeenCalled();
  });

  it('rejects invalid secret headers because secret auth is not an access mode', async () => {
    authMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(metricsMock.getReport).not.toHaveBeenCalled();
  });

  it('allows ADMIN sessions', async () => {
    authMock.mockResolvedValue(sessionWithRole('ADMIN'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      metrics: enabledReport,
      health,
    });
    expect(typeof body.timestamp).toBe('string');
  });

  it('allows SUPER_ADMIN sessions', async () => {
    authMock.mockResolvedValue(sessionWithRole('SUPER_ADMIN'));

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      metrics: enabledReport,
      health,
    });
  });

  it('keeps metrics disabled behavior for authorized sessions', async () => {
    authMock.mockResolvedValue(sessionWithRole('ADMIN'));
    metricsMock.getReport.mockReturnValue({
      ...enabledReport,
      enabled: false,
    });

    const response = await GET();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'metrics_disabled' });
    expect(repositoryMock.getRepositoryHealth).not.toHaveBeenCalled();
  });

  it('does not change the authorized metrics payload shape', async () => {
    authMock.mockResolvedValue(sessionWithRole('ADMIN'));

    const response = await GET();
    const body = await response.json();

    expect(body.metrics).toEqual(enabledReport);
    expect(body.health).toEqual(health);
    expect(Object.keys(body).sort()).toEqual(['health', 'metrics', 'timestamp']);
  });
});
