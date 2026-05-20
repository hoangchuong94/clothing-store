import NextAuth from 'next-auth';

import { authEdgeConfig } from './auth-edge.config';

/** Edge-safe auth helper for proxy/middleware only */
export const { auth: edgeAuth } = NextAuth(authEdgeConfig);
