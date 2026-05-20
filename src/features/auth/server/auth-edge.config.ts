import type { NextAuthConfig } from 'next-auth';

import { isEmailVerified } from '../lib/verification/status';

/**
 * Edge-compatible Auth.js config for middleware/proxy.
 * No Prisma, nodemailer, or Node crypto — JWT/session only.
 */
export const authEdgeConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? token.role;
        token.scopes = Array.isArray(user.scopes) ? [...user.scopes] : token.scopes;
        token.isEmailVerified =
          user.isEmailVerified ??
          ('emailVerified' in user
            ? isEmailVerified(user.emailVerified as Date | null | undefined)
            : false);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id && token.role && token.scopes) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.scopes = [...token.scopes];
        session.user.isEmailVerified = Boolean(token.isEmailVerified);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
