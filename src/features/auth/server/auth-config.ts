import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/server/prisma/prisma';
import { ROLE_SCOPES } from '../config/roles';
import { isEmailVerified } from '../lib/verification/status';
import { authEdgeConfig } from './auth-edge.config';
import { LoginSchema } from '../schemas/auth-schemas';
import { verifyCredentialsLogin } from './credentials-login';

function invalidateAuthToken(token: {
  id?: unknown;
  role?: unknown;
  scopes?: unknown;
  isEmailVerified?: unknown;
  isUserActive?: boolean;
}) {
  delete token.id;
  delete token.role;
  delete token.scopes;
  token.isEmailVerified = false;
  token.isUserActive = false;
}

const authProviders = [
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : []),
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID,
          clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authEdgeConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authProviders,
    Credentials({
      name: 'credentials',
      async authorize(credentials, request) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const result = await verifyCredentialsLogin(parsed.data, request.headers);
        if (result.status !== 'SUCCESS') return null;

        const roleName = result.user.role.name;
        const scopes = ROLE_SCOPES[roleName] ?? [];

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          image: result.user.image,
          role: roleName,
          scopes: [...scopes],
          isEmailVerified: true,
        };
      },
    }),
  ],
  callbacks: {
    ...authEdgeConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? token.role;
        token.scopes = Array.isArray(user.scopes) ? [...user.scopes] : token.scopes;
        const oauthVerified =
          'emailVerified' in user
            ? isEmailVerified(user.emailVerified as Date | null | undefined)
            : false;
        token.isEmailVerified = user.isEmailVerified ?? oauthVerified;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            status: true,
            emailVerified: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!dbUser?.role || dbUser.status !== 'ACTIVE') {
          invalidateAuthToken(token);
          return token;
        }

        const scopes = ROLE_SCOPES[dbUser.role.name] ?? [];
        token.role = dbUser.role.name;
        token.scopes = [...scopes];
        token.isEmailVerified = isEmailVerified(dbUser.emailVerified);
        token.isUserActive = true;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.isUserActive === false || !token.id || !token.role || !token.scopes) {
        delete (session as { user?: unknown }).user;
        return session;
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.scopes = [...token.scopes];
        session.user.isEmailVerified = Boolean(token.isEmailVerified);
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider && account.provider !== 'credentials') {
        const providerEmailVerified =
          'emailVerified' in user
            ? isEmailVerified(user.emailVerified as Date | null | undefined)
            : Boolean(user.isEmailVerified);

        if (user.id && !providerEmailVerified) {
          const now = new Date();
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: now },
          });
          await prisma.emailVerificationToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: now },
          });
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) {
          return url;
        }
      } catch {
        // Invalid URL should never be used for redirects.
      }
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      const role = await prisma.role.findUnique({
        where: { name: 'CUSTOMER' },
      });

      if (!role) {
        throw new Error('CUSTOMER role not seeded');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          roleId: role.id,
          ...('emailVerified' in user && user.emailVerified
            ? { emailVerified: user.emailVerified as Date }
            : {}),
        },
      });
    },
  },
});
