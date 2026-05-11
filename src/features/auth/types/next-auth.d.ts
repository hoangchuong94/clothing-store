import 'next-auth';
import 'next-auth/jwt';
import type { RoleCode, Scope } from '@/types/auth.types';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			email?: string | null;
			name?: string | null;
			image?: string | null;

			role: RoleCode;
			scopes: readonly Scope[];
		};
	}

	interface User {
		role: RoleCode;
		scopes: readonly Scope[];
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id?: string;
		role?: RoleCode;
		scopes?: readonly Scope[];
	}
}
