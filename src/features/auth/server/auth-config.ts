import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/server/prisma/prisma';
import { ROLE_SCOPES } from '../config/roles';

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
  adapter: PrismaAdapter(prisma),

  secret: process.env.AUTH_SECRET,

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/signin',
    error: '/error',
  },

  providers: [
    ...authProviders,

    Credentials({
      name: 'credentials',
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== 'string' ||
          typeof credentials.password !== 'string'
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: true,
          },
        });

        if (!user || !user.password || !user.role || user.status !== 'ACTIVE') return null;

        const valid = await bcrypt.compare(credentials.password, user.password);

        if (!valid) return null;

        const roleName = user.role.name;
        const scopes = ROLE_SCOPES[user.role.name] ?? [];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: roleName,
          scopes: [...scopes],
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? token.role;
        token.scopes = Array.isArray(user.scopes) ? [...user.scopes] : token.scopes;
      }

      if (token.id && (!token.role || !token.scopes)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { role: true },
        });

        if (dbUser?.role) {
          const scopes = ROLE_SCOPES[dbUser.role.name] ?? [];
          token.role = dbUser.role.name;
          token.scopes = [...scopes];
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id && token.role && token.scopes) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.scopes = [...token.scopes];
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return url;
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
        },
      });
    },
  },
});
