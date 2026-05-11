export const API_ROUTES = {
	AUTH: '/api/auth',
	USERS: '/api/users',
	PRODUCTS: '/api/products',
	ORDERS: '/api/orders',
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
export type AppRoute = DeepRoute<typeof API_ROUTES>;
