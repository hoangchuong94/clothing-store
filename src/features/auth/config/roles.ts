export const ROLE_SCOPES = {
	SUPER_ADMIN: ['admin', 'staff', 'seller'],
	ADMIN: ['admin', 'staff'],
	STAFF: ['staff'],
	SELLER: ['seller'],
	CUSTOMER: ['account', 'cart'],
} as const;
