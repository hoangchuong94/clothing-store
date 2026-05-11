import { APP_ROUTES } from '@/features/auth/config/app-routes';
import type { AppRoute } from '@/features/auth/config/app-routes';

/* --------------------------------------------------
 * PUBLIC ROUTES
 * -------------------------------------------------- */
export const PUBLIC_ROUTES: readonly AppRoute[] = [
  APP_ROUTES.HOME,
  APP_ROUTES.LEGAL.TERMS,
  APP_ROUTES.LEGAL.PRIVACY,
];

/* --------------------------------------------------
 * AUTH REQUIRED
 * -------------------------------------------------- */
export const AUTH_ROUTES: readonly AppRoute[] = [
  APP_ROUTES.AUTH.SIGN_IN,
  APP_ROUTES.AUTH.SIGN_UP,
  APP_ROUTES.AUTH.FORGOT_PASSWORD,
  APP_ROUTES.AUTH.ERROR,
  APP_ROUTES.AUTH.FORBIDDEN,
];

/* ----------------------------------
 * Protected routes
 * ---------------------------------- */
export const PROTECTED_ROUTES = [
  APP_ROUTES.DASHBOARD,
  APP_ROUTES.ACCOUNT.ROOT,
  APP_ROUTES.CART,
] as const;

/* --------------------------------------------------
 * ADMIN AREA
 * -------------------------------------------------- */
export const ADMIN_ROUTES: readonly AppRoute[] = [
  APP_ROUTES.ADMIN.ROOT,
  APP_ROUTES.ADMIN.USERS,
  APP_ROUTES.ADMIN.PRODUCTS,
];
