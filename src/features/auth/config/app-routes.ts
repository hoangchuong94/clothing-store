export const APP_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',

  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    DASHBOARD: '/dashboard',
  },

  STAFF: '/staff',

  SELLER: '/seller',

  ACCOUNT: {
    ROOT: '/account',
    PROFILE: '/account/profile',
    SECURITY: '/account/security',
  },

  CART: '/cart',

  AUTH: {
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_EMAIL: '/verify-email',
    VERIFY_EMAIL_CONFIRM: '/verify-email/confirm',
    VERIFY_EMAIL_SUCCESS: '/verify-email/success',
    VERIFY_EMAIL_ERROR: '/verify-email/error',
    ERROR: '/error',
    FORBIDDEN: '/forbidden',
  },

  SHOP: {
    MEN: '/men',
    WOMEN: '/women',
    NEW: '/new',
    SALE: '/sale',
  },

  LEGAL: {
    TERMS: '/terms',
    PRIVACY: '/privacy',
  },

  ROLE_REDIRECTS: {
    ADMIN: '/dashboard',
    SUPER_ADMIN: '/admin',
    STAFF: '/staff',
    SELLER: '/seller',
    CUSTOMER: '/',
  },
} as const;

/* ----------------------------------
 * Type helpers
 * ---------------------------------- */
type ValueOf<T> = T[keyof T];

type DeepRoute<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? DeepRoute<ValueOf<T>>
    : never;

/* ----------------------------------
 * AppRoute = union of all leaf routes
 * ---------------------------------- */
export type AppRoute = DeepRoute<typeof APP_ROUTES>;
