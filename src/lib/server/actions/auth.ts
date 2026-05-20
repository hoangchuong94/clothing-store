/**
 * Server auth helpers for cross-cutting consumers (e.g. cart server actions).
 * Delegates to the auth feature adapter — do not call `auth()` directly here.
 */

import { getCurrentUser, mapCurrentUserToSession } from '@/features/auth/server/session';
import type { UserSession } from '@/features/auth/types/user-session';

export { getCurrentUser } from '@/features/auth/server/session';

/**
 * Legacy session shape for cart and other server actions.
 * @deprecated Prefer `getCurrentUser()` for new server code.
 */
export async function getCurrentUserSession(): Promise<UserSession> {
  try {
    const user = await getCurrentUser();
    return mapCurrentUserToSession(user);
  } catch (error) {
    console.error('Error getting user session:', error);
    return mapCurrentUserToSession(null);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get current user ID
 * Returns undefined if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string | undefined> {
  const user = await getCurrentUser();
  return user?.userId;
}
