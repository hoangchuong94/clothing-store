/**
 * Legacy minimal session shape for server actions (e.g. cart).
 * Prefer `getCurrentUser()` returning `CurrentUser | null` for new code.
 */
export interface UserSession {
  userId?: string;
  isAuthenticated: boolean;
}
