export { auth, handlers, signIn, signOut } from './auth-config';
export { edgeAuth } from './auth-edge';
export { getCurrentUser, getCurrentUserSession, mapCurrentUserToSession } from './session';

export { PUBLIC_API_ROUTES, isPublicApiRoute } from '../config/api-access';
export { APP_ROUTES } from '../config/app-routes';
export {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  EMAIL_VERIFICATION_EXEMPT_ROUTES,
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
} from '../config/access';
export { extractLocale, matchRoute } from '../lib/match-route';
export type { UserSession } from '../types/user-session';
