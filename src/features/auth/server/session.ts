import { auth } from '@/features/auth/server/auth-config';
import type { CurrentUser } from '@/features/auth/types/current-user';
import type { UserSession } from '@/features/auth/types/user-session';

/**
 * Single server-side source of truth for the current user.
 * Returns `null` for guests (no stub / no fake user).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return {
    userId,
    email: session.user.email,
    name: session.user.name,
    isEmailVerified: session.user.isEmailVerified,
  };
}

/**
 * Maps adapter identity to the legacy `UserSession` shape used by cart server actions.
 */
export function mapCurrentUserToSession(user: CurrentUser | null): UserSession {
  if (!user) {
    return {
      isAuthenticated: false,
      userId: undefined,
    };
  }

  return {
    isAuthenticated: true,
    userId: user.userId,
  };
}

export async function getCurrentUserSession(): Promise<UserSession> {
  const user = await getCurrentUser();
  return mapCurrentUserToSession(user);
}
