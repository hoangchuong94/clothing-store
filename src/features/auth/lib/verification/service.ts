import type { Prisma } from '@/generated/prisma/client';
import type { EmailLocale } from '@/lib/email/types';
import { buildVerificationUrl, sendVerificationEmail } from '@/lib/email/send';
import prisma from '@/lib/server/prisma/prisma';

import { verificationConfig } from './config';
import { checkResendCooldown, nextResendCooldownState } from './rate-limit';
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
};

type UserForResend = {
  id: string;
  email: string;
  name: string | null;
} & ResendState;

type ClaimedResendSlot = Pick<
  ResendState,
  'verificationResendAt'
>;

async function invalidateVerificationTokenById(
  tokenId: string,
  tx: TransactionClient | typeof prisma = prisma,
): Promise<void> {
  await tx.emailVerificationToken.updateMany({
    where: {
      id: tokenId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

async function issueVerificationTokenRecord(
  userId: string,
  email: string,
  tx: TransactionClient | typeof prisma = prisma,
): Promise<{ plainToken: string; tokenId: string }> {
  const plainToken = generateVerificationToken();
  const hashedToken = hashVerificationToken(plainToken);
  const expiresAt = getVerificationExpiryDate();

  const tokenRecord = await tx.emailVerificationToken.create({
    data: {
      userId,
      email: email.toLowerCase().trim(),
      hashedToken,
      expiresAt,
    },
    select: {
      id: true,
    },
  });

  return { plainToken, tokenId: tokenRecord.id };
}

export async function issueVerificationToken(
  userId: string,
  email: string,
  tx: TransactionClient | typeof prisma = prisma,
): Promise<string> {
  const { plainToken } = await issueVerificationTokenRecord(userId, email, tx);
  return plainToken;
}

async function tryClaimResendSlot(
  userId: string,
  previousState: ResendState,
): Promise<{ claimed: true; claimedState: ClaimedResendSlot } | { claimed: false }> {
  const resendState = nextResendCooldownState();
  const updated = await prisma.user.updateMany({
    where: {
      id: userId,
      verificationResendAt: previousState.verificationResendAt,
    },
    data: resendState,
  });
  if (updated.count !== 1) {
    return { claimed: false };
  }
  return { claimed: true, claimedState: resendState };
}

async function rollbackResendSlot(
  userId: string,
  claimedState: ClaimedResendSlot,
  previousState: ResendState,
): Promise<void> {
  await prisma.user.updateMany({
    where: {
      id: userId,
      verificationResendAt: claimedState.verificationResendAt,
    },
    data: previousState,
  });
}

async function sendVerificationToUser(
  user: UserForResend,
  locale: EmailLocale,
): Promise<void> {
  const { plainToken, tokenId } = await issueVerificationTokenRecord(user.id, user.email);

  try {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl: buildVerificationUrl(locale, plainToken),
      locale,
      expiresInHours: verificationConfig.tokenExpiryHours,
    });
  } catch (error) {
    await invalidateVerificationTokenById(tokenId).catch(() => undefined);
    throw error;
  }
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
  };

  const resendState = {
    verificationResendAt: user.verificationResendAt,
  };

  if (options?.skipRateLimit) {
    await sendVerificationToUser(resendUser, locale);
    await prisma.user.update({
      where: { id: user.id },
      data: nextResendCooldownState(),
    });
    return { sent: true };
  }

  const limit = checkResendCooldown(resendState);

  if (!limit.allowed) {
    return {
      sent: false,
      rateLimited: true,
      retryAfterSeconds: limit.retryAfterSeconds,
    };
  }

  const claim = await tryClaimResendSlot(user.id, resendState);

  if (!claim.claimed) {
    return { sent: false, rateLimited: true };
  }

  try {
    await sendVerificationToUser(resendUser, locale);
  } catch (error) {
    await rollbackResendSlot(user.id, claim.claimedState, resendState).catch(() => undefined);
    throw error;
  }

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
  };

  const limit = checkResendCooldown(resendState);

  if (!limit.allowed) {
    return { success: true };
  }

  const claim = await tryClaimResendSlot(user.id, resendState);

  if (!claim.claimed) {
    return { success: true };
  }

  try {
    await sendVerificationToUser(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        verificationResendAt: user.verificationResendAt,
      },
      locale,
    );
  } catch (error) {
    await rollbackResendSlot(user.id, claim.claimedState, resendState).catch(() => undefined);
    console.error('Verification email resend failed:', error);
  }

  return { success: true };
}
