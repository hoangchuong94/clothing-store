import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, emailMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    emailVerificationToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  emailMock: {
    buildVerificationUrl: vi.fn(),
    sendVerificationEmail: vi.fn(),
  },
}));

vi.mock('@/lib/server/prisma/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/lib/email/send', () => emailMock);

import { resendVerificationByEmail } from './service';

function unverifiedUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    emailVerified: null,
    password: 'hashed-password',
    verificationResendAt: null,
    verificationResendCount: 0,
    verificationResendWindowStart: null,
    ...overrides,
  };
}

describe('email verification service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.emailVerificationToken.create.mockResolvedValue({ id: 'token-1' });
    prismaMock.emailVerificationToken.updateMany.mockResolvedValue({ count: 1 });
    emailMock.buildVerificationUrl.mockReturnValue('https://example.com/verify?token=token');
    emailMock.sendVerificationEmail.mockResolvedValue(undefined);
  });

  it('returns generic success when the email does not belong to a credentials user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await resendVerificationByEmail('missing@example.com', 'en');

    expect(result).toEqual({ success: true });
    expect(emailMock.sendVerificationEmail).not.toHaveBeenCalled();
    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });

  it('returns generic success during cooldown without revealing that the account exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      unverifiedUser({
        verificationResendAt: new Date(),
        verificationResendCount: 1,
        verificationResendWindowStart: new Date(),
      }),
    );

    const result = await resendVerificationByEmail('user@example.com', 'en');

    expect(result).toEqual({ success: true });
    expect(emailMock.sendVerificationEmail).not.toHaveBeenCalled();
    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });

  it('sends a new verification email for an unverified credentials user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(unverifiedUser());

    const result = await resendVerificationByEmail('USER@example.com', 'en');

    expect(result).toEqual({ success: true });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      select: expect.any(Object),
    });
    expect(prismaMock.user.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledOnce();
    expect(prismaMock.emailVerificationToken.updateMany).not.toHaveBeenCalled();
    expect(emailMock.sendVerificationEmail).toHaveBeenCalledOnce();
  });

  it('rolls back the resend slot and invalidates the unsent token when email delivery fails', async () => {
    prismaMock.user.findUnique.mockResolvedValue(unverifiedUser());
    emailMock.sendVerificationEmail.mockRejectedValue(new Error('smtp down'));

    const result = await resendVerificationByEmail('user@example.com', 'en');

    expect(result).toEqual({ success: true });
    expect(prismaMock.user.updateMany).toHaveBeenCalledTimes(2);
    expect(prismaMock.emailVerificationToken.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'token-1',
        usedAt: null,
      },
      data: {
        usedAt: expect.any(Date),
      },
    });
  });
});
