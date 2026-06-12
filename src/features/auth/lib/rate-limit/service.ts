import {
  getAuthRateLimitPolicy,
  type AuthRateLimitAction,
  type AuthRateLimitPolicy,
} from './config';
import { buildEmailRateLimitKey, buildIpRateLimitKey } from './keys';
import prisma from '@/lib/server/prisma/prisma';
import { Prisma } from '@/generated/prisma/client';
import { randomUUID } from 'node:crypto';

export type AuthRateLimitScope = 'email' | 'ip';

export type AuthRateLimitCheckInput =
  | {
      action: Extract<
        AuthRateLimitAction,
        'LOGIN_EMAIL' | 'REGISTER_EMAIL' | 'RESEND_VERIFICATION_EMAIL'
      >;
      scope: 'email';
      email: string;
      secret?: string;
    }
  | {
      action: Extract<AuthRateLimitAction, 'LOGIN_IP' | 'REGISTER_IP' | 'RESEND_VERIFICATION_IP'>;
      scope: 'ip';
      ip: string | null | undefined;
      secret?: string;
    };

export type AuthRateLimitContext = {
  action: AuthRateLimitAction;
  scope: AuthRateLimitScope;
  keyHash: string;
  policy: AuthRateLimitPolicy;
};

export type AuthRateLimitResult =
  | {
      allowed: true;
      context: AuthRateLimitContext;
    }
  | {
      allowed: false;
      context: AuthRateLimitContext;
      retryAfterSeconds: number;
      reason: 'RATE_LIMITED' | 'BLOCKED';
    };

type AuthRateLimitBucketRow = {
  count: number;
  windowExpires: Date;
  blockedUntil: Date | null;
};

export function createAuthRateLimitContext(
  input: AuthRateLimitCheckInput,
): AuthRateLimitContext {
  const keyHash =
    input.scope === 'email'
      ? buildEmailRateLimitKey(input.action, input.email, input.secret)
      : buildIpRateLimitKey(input.action, input.ip, input.secret);

  return {
    action: input.action,
    scope: input.scope,
    keyHash,
    policy: getAuthRateLimitPolicy(input.action),
  };
}

function retryAfterSeconds(until: Date, now: Date): number {
  return Math.max(1, Math.ceil((until.getTime() - now.getTime()) / 1000));
}

function resultFromRow(
  context: AuthRateLimitContext,
  row: AuthRateLimitBucketRow | null,
  now: Date,
): AuthRateLimitResult {
  if (!row) {
    return { allowed: true, context };
  }

  if (row.blockedUntil && row.blockedUntil > now) {
    return {
      allowed: false,
      context,
      retryAfterSeconds: retryAfterSeconds(row.blockedUntil, now),
      reason: 'BLOCKED',
    };
  }

  if (row.windowExpires <= now) {
    return { allowed: true, context };
  }

  if (row.count > context.policy.threshold) {
    return {
      allowed: false,
      context,
      retryAfterSeconds: retryAfterSeconds(row.windowExpires, now),
      reason: 'RATE_LIMITED',
    };
  }

  return { allowed: true, context };
}

export async function checkAuthRateLimit(
  input: AuthRateLimitCheckInput,
  now: Date = new Date(),
): Promise<AuthRateLimitResult> {
  const context = createAuthRateLimitContext(input);
  const rows = await prisma.$queryRaw<AuthRateLimitBucketRow[]>(
    Prisma.sql`
      SELECT
        "count",
        "windowExpires",
        "blockedUntil"
      FROM "auth_rate_limit_buckets"
      WHERE "action" = ${context.action}::"AuthRateLimitAction"
        AND "keyHash" = ${context.keyHash}
      LIMIT 1
    `,
  );

  return resultFromRow(context, rows[0] ?? null, now);
}

export async function consumeAuthRateLimit(
  input: AuthRateLimitCheckInput,
  now: Date = new Date(),
): Promise<AuthRateLimitResult> {
  const context = createAuthRateLimitContext(input);
  const windowExpires = new Date(now.getTime() + context.policy.windowSeconds * 1000);
  const blockedUntil = new Date(now.getTime() + context.policy.blockSeconds * 1000);

  const rows = await prisma.$queryRaw<AuthRateLimitBucketRow[]>(
    Prisma.sql`
      INSERT INTO "auth_rate_limit_buckets" (
        "id",
        "action",
        "keyHash",
        "windowStart",
        "windowExpires",
        "count",
        "blockedUntil",
        "lastAttemptAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${context.action}::"AuthRateLimitAction",
        ${context.keyHash},
        ${now},
        ${windowExpires},
        1,
        NULL,
        ${now},
        ${now}
      )
      ON CONFLICT ("action", "keyHash") DO UPDATE SET
        "windowStart" = CASE
          WHEN "auth_rate_limit_buckets"."windowExpires" <= ${now}
            THEN ${now}
          ELSE "auth_rate_limit_buckets"."windowStart"
        END,
        "windowExpires" = CASE
          WHEN "auth_rate_limit_buckets"."windowExpires" <= ${now}
            THEN ${windowExpires}
          ELSE "auth_rate_limit_buckets"."windowExpires"
        END,
        "count" = CASE
          WHEN "auth_rate_limit_buckets"."windowExpires" <= ${now}
            THEN 1
          ELSE "auth_rate_limit_buckets"."count" + 1
        END,
        "blockedUntil" = CASE
          WHEN "auth_rate_limit_buckets"."blockedUntil" > ${now}
            THEN "auth_rate_limit_buckets"."blockedUntil"
          WHEN "auth_rate_limit_buckets"."windowExpires" <= ${now}
            THEN NULL
          WHEN "auth_rate_limit_buckets"."count" + 1 > ${context.policy.threshold}
            THEN ${blockedUntil}
          ELSE "auth_rate_limit_buckets"."blockedUntil"
        END,
        "lastAttemptAt" = ${now},
        "updatedAt" = ${now}
      RETURNING
        "count",
        "windowExpires",
        "blockedUntil"
    `,
  );

  return resultFromRow(context, rows[0] ?? null, now);
}

export async function reserveAuthRateLimitAttempt(
  input: AuthRateLimitCheckInput,
  now: Date = new Date(),
): Promise<AuthRateLimitResult> {
  return consumeAuthRateLimit(input, now);
}

export async function resetAuthRateLimit(input: AuthRateLimitCheckInput): Promise<void> {
  const context = createAuthRateLimitContext(input);

  await prisma.$executeRaw(
    Prisma.sql`
      DELETE FROM "auth_rate_limit_buckets"
      WHERE "action" = ${context.action}::"AuthRateLimitAction"
        AND "keyHash" = ${context.keyHash}
    `,
  );
}
