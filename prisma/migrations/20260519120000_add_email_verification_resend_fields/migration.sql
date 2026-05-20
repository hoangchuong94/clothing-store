-- Email verification resend rate-limit fields on users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationResendAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationResendCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationResendWindowStart" TIMESTAMP(3);
