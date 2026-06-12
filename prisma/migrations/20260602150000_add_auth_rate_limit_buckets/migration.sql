-- Auth rate-limit buckets for login/register/resend throttling.
CREATE TYPE "AuthRateLimitAction" AS ENUM (
    'LOGIN_EMAIL',
    'LOGIN_IP',
    'REGISTER_EMAIL',
    'REGISTER_IP',
    'RESEND_VERIFICATION_EMAIL',
    'RESEND_VERIFICATION_IP'
);

CREATE TABLE "auth_rate_limit_buckets" (
    "id" TEXT NOT NULL,
    "action" "AuthRateLimitAction" NOT NULL,
    "keyHash" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowExpires" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_rate_limit_buckets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_rate_limit_buckets_action_keyHash_key"
    ON "auth_rate_limit_buckets"("action", "keyHash");

CREATE INDEX "auth_rate_limit_buckets_action_windowExpires_idx"
    ON "auth_rate_limit_buckets"("action", "windowExpires");

CREATE INDEX "auth_rate_limit_buckets_blockedUntil_idx"
    ON "auth_rate_limit_buckets"("blockedUntil");

CREATE INDEX "auth_rate_limit_buckets_updatedAt_idx"
    ON "auth_rate_limit_buckets"("updatedAt");
