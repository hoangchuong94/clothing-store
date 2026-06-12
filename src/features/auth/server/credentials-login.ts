import bcrypt from 'bcryptjs';

import prisma from '@/lib/server/prisma/prisma';
import type { UserRole } from '@/generated/prisma/enums';
import { reserveAuthRateLimitAttempt, resetAuthRateLimit } from '../lib/rate-limit';
import type { HeadersLike } from '../lib/rate-limit/request';
import { extractClientIp } from '../lib/rate-limit/request';
import { isEmailVerified } from '../lib/verification/status';

type CredentialsLoginUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: {
    name: UserRole;
  };
};

export type CredentialsLoginResult =
  | { status: 'SUCCESS'; user: CredentialsLoginUser }
  | { status: 'INVALID_CREDENTIALS' }
  | { status: 'EMAIL_NOT_VERIFIED'; email: string }
  | { status: 'RATE_LIMIT_EXCEEDED' };

export async function verifyCredentialsLogin(
  credentials: { email: string; password: string },
  headers: HeadersLike,
): Promise<CredentialsLoginResult> {
  const { email, password } = credentials;
  const ip = extractClientIp(headers);
  const emailRateLimitInput = {
    action: 'LOGIN_EMAIL' as const,
    scope: 'email' as const,
    email,
  };
  const ipRateLimitInput = {
    action: 'LOGIN_IP' as const,
    scope: 'ip' as const,
    ip,
  };

  const ipReservation = await reserveAuthRateLimitAttempt(ipRateLimitInput);
  if (!ipReservation.allowed) {
    return { status: 'RATE_LIMIT_EXCEEDED' };
  }

  const emailReservation = await reserveAuthRateLimitAttempt(emailRateLimitInput);
  if (!emailReservation.allowed) {
    return { status: 'RATE_LIMIT_EXCEEDED' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
    },
  });

  if (!user || !user.password || !user.role || user.status !== 'ACTIVE') {
    return { status: 'INVALID_CREDENTIALS' };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { status: 'INVALID_CREDENTIALS' };
  }

  if (!isEmailVerified(user.emailVerified)) {
    await resetAuthRateLimit(emailRateLimitInput);
    return {
      status: 'EMAIL_NOT_VERIFIED',
      email: user.email ?? email,
    };
  }

  await resetAuthRateLimit(emailRateLimitInput);

  return {
    status: 'SUCCESS',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: {
        name: user.role.name,
      },
    },
  };
}
