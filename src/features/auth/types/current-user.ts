/**
 * Server-side authenticated user identity (Phase 1 auth adapter).
 * Guest is represented as `null` — never a fake user object.
 */
export type CurrentUser = {
  userId: string;
  email?: string | null;
  name?: string | null;
  isEmailVerified?: boolean;
};
