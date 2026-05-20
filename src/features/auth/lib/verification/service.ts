import type { Prisma } from '@/generated/prisma/client';
import type { EmailLocale } from '@/lib/email/types';
import { buildVerificationUrl, sendVerificationEmail } from '@/lib/email/send';
import prisma from '@/lib/server/prisma/prisma';

import { verificationConfig } from './config';
import { checkResendRateLimit, nextResendState } from './rate-limit';
import {
  generateVerificationToken,
  getVerificationExpiryDate,
  hashVerificationToken,
} from './token';

import { isEmailVerified } from './status';

export { isEmailVerified };

type TransactionClient = Prisma.TransactionClient;

type ResendState = {
  verificationResendAt: Date | null;
  verificationResendCount: number;
  verificationResendWindowStart: Date | null;
};

type UserForResend = {
  id: string;
  email: string;
  name: string | null;
} & ResendState;

async function invalidateActiveVerificationTokens(
  userId: string,
  tx: TransactionClient | typeof prisma = prisma,
): Promise<void> {
  await tx.emailVerificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function issueVerificationToken(
  userId: string,
  email: string,
  tx: TransactionClient | typeof prisma = prisma,
): Promise<string> {
  const plainToken = generateVerificationToken();
  const hashedToken = hashVerificationToken(plainToken);
  const expiresAt = getVerificationExpiryDate();

  await invalidateActiveVerificationTokens(userId, tx);

  await tx.emailVerificationToken.create({
    data: {
      userId,
      email: email.toLowerCase().trim(),
      hashedToken,
      expiresAt,
    },
  });

  return plainToken;
}

async function tryClaimResendSlot(
  userId: string,
  previousState: ResendState,
): Promise<boolean> {
  const resendState = nextResendState(previousState);
  const updated = await prisma.user.updateMany({
    where: {
      id: userId,
      verificationResendAt: previousState.verificationResendAt,
      verificationResendCount: previousState.verificationResendCount,
      verificationResendWindowStart: previousState.verificationResendWindowStart,
    },
    data: resendState,
  });
  return updated.count === 1;
}

async function sendVerificationToUser(
  user: UserForResend,
  locale: EmailLocale,
): Promise<void> {
  const plainToken = await issueVerificationToken(user.id, user.email);

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl: buildVerificationUrl(locale, plainToken),
    locale,
    expiresInHours: verificationConfig.tokenExpiryHours,
  });
}

export async function createAndSendVerification(
  userId: string,
  locale: EmailLocale,
  options?: { skipRateLimit?: boolean },
): Promise<{ sent: boolean; rateLimited?: boolean; retryAfterSeconds?: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      verificationResendAt: true,
      verificationResendCount: true,
      verificationResendWindowStart: true,
    },
  });

  if (!user?.email || isEmailVerified(user.emailVerified)) {
    return { sent: false };
  }

  const email = user.email;
  const resendUser: UserForResend = {
    id: user.id,
    email,
    name: user.name,
    verificationResendAt: user.verificationResendAt,
    verificationResendCount: user.verificationResendCount,
    verificationResendWindowStart: user.verificationResendWindowStart,
  };

  const resendState = {
    verificationResendAt: user.verificationResendAt,
    verificationResendCount: user.verificationResendCount,
    verificationResendWindowStart: user.verificationResendWindowStart,
  };

  if (options?.skipRateLimit) {
    await sendVerificationToUser(resendUser, locale);
    await prisma.user.update({
      where: { id: user.id },
      data: nextResendState(resendState),
    });
    return { sent: true };
  }

  const limit = checkResendRateLimit(resendState);

  if (!limit.allowed) {
    return {
      sent: false,
      rateLimited: true,
      retryAfterSeconds:
        limit.reason === 'COOLDOWN' ? limit.retryAfterSeconds : undefined,
    };
  }

  const claimed = await tryClaimResendSlot(user.id, resendState);

  if (!claimed) {
    return { sent: false, rateLimited: true };
  }

  await sendVerificationToUser(resendUser, locale);

  return { sent: true };
}

export type VerifyEmailResult =
  | { status: 'SUCCESS' }
  | { status: 'ALREADY_VERIFIED' }
  | { status: 'INVALID_OR_EXPIRED' };

async function resolveUsedOrInvalidToken(
  tx: TransactionClient,
  tokenHash: string,
): Promise<VerifyEmailResult> {
  const record = await tx.emailVerificationToken.findFirst({
    where: { hashedToken: tokenHash },
    include: {
      user: {
        select: { emailVerified: true },
      },
    },
  });

  if (record?.user && isEmailVerified(record.user.emailVerified)) {
    return { status: 'ALREADY_VERIFIED' };
  }

  return { status: 'INVALID_OR_EXPIRED' };
}

export async function verifyEmailWithToken(token: string): Promise<VerifyEmailResult> {
  const tokenHash = hashVerificationToken(token);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const claim = await tx.emailVerificationToken.updateMany({
      where: {
        hashedToken: tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (claim.count === 0) {
      return resolveUsedOrInvalidToken(tx, tokenHash);
    }

    const record = await tx.emailVerificationToken.findFirst({
      where: { hashedToken: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!record?.user?.email) {
      return { status: 'INVALID_OR_EXPIRED' };
    }

    if (record.email.toLowerCase() !== record.user.email.toLowerCase()) {
      return { status: 'INVALID_OR_EXPIRED' };
    }

    if (isEmailVerified(record.user.emailVerified)) {
      return { status: 'ALREADY_VERIFIED' };
    }

    await tx.user.update({
      where: { id: record.userId },
      data: {
        emailVerified: now,
        verificationResendAt: null,
        verificationResendCount: 0,
        verificationResendWindowStart: null,
      },
    });

    await tx.emailVerificationToken.updateMany({
      where: {
        userId: record.userId,
        id: { not: record.id },
        usedAt: null,
      },
      data: { usedAt: now },
    });

    return { status: 'SUCCESS' };
  });
}

export async function resendVerificationByEmail(
  email: string,
  locale: EmailLocale,
): Promise<{ success: true } | { success: false; code: string; retryAfterSeconds?: number }> {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      password: true,
      verificationResendAt: true,
      verificationResendCount: true,
      verificationResendWindowStart: true,
    },
  });

  if (!user?.email || !user.password) {
    return { success: true };
  }

  if (isEmailVerified(user.emailVerified)) {
    return { success: true };
  }

  const resendState = {
    verificationResendAt: user.verificationResendAt,
    verificationResendCount: user.verificationResendCount,
    verificationResendWindowStart: user.verificationResendWindowStart,
  };

  const limit = checkResendRateLimit(resendState);

  if (!limit.allowed) {
    if (limit.reason === 'COOLDOWN') {
      return {
        success: false,
        code: 'RESEND_COOLDOWN',
        retryAfterSeconds: limit.retryAfterSeconds,
      };
    }
    return { success: false, code: 'RESEND_HOURLY_LIMIT' };
  }

  const claimed = await tryClaimResendSlot(user.id, resendState);

  if (!claimed) {
    const recheck = checkResendRateLimit(resendState);
    if (!recheck.allowed && recheck.reason === 'COOLDOWN') {
      return {
        success: false,
        code: 'RESEND_COOLDOWN',
        retryAfterSeconds: recheck.retryAfterSeconds,
      };
    }
    if (!recheck.allowed) {
      return { success: false, code: 'RESEND_HOURLY_LIMIT' };
    }
    return { success: true };
  }

  await sendVerificationToUser(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      verificationResendAt: user.verificationResendAt,
      verificationResendCount: user.verificationResendCount,
      verificationResendWindowStart: user.verificationResendWindowStart,
    },
    locale,
  );

  return { success: true };
}
