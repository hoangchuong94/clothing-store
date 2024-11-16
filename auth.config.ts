import { DEFAULT_ADMIN_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from '@/routes';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import google from 'next-auth/providers/google';
import github from 'next-auth/providers/github';
import facebook from 'next-auth/providers/facebook';
import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';

export const authConfig = {
    pages: {
        signIn: '/signIn',
    },
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    providers: [
        google,
        github,
        facebook,
        Credentials({
            async authorize(credentials) {
                if (!credentials.email || !credentials.password) {
                    return null;
                }
                const user = await prisma.user.findUnique({
                    where: {
                        email: String(credentials.email),
                    },
                });

                if (!user || !(await bcryptjs.compare(String(credentials.password), user.password!))) {
                    return null;
                }
                return user;
            },
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
            const isAuthRoute = authRoutes.includes(nextUrl.pathname);
            const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

            if (isApiAuthRoute) {
                if (nextUrl.href.includes('error')) {
                    let error = nextUrl.search;
                    return Response.redirect(new URL(`/signIn${error}`, nextUrl));
                }
                return true;
            }

            if (isAuthRoute) {
                if (isLoggedIn && auth.user.role === 'ADMIN') {
                    return Response.redirect(new URL(DEFAULT_ADMIN_LOGIN_REDIRECT, nextUrl));
                }

                if (isLoggedIn && auth.user.role === 'USER') {
                    return Response.redirect(new URL('/', nextUrl));
                }
                return true;
            }

            if (!isPublicRoute) {
                if (isLoggedIn && auth?.user.role !== 'ADMIN') {
                    let callbackUrl = nextUrl.pathname;
                    if (nextUrl.search) {
                        callbackUrl += nextUrl.search;
                    }
                    const encodedUrl = encodeURIComponent(callbackUrl);
                    return Response.redirect(new URL(`/feedback?callbackUrl=${encodedUrl}`, nextUrl));
                }

                if (!isLoggedIn) {
                    return Response.redirect(new URL('/signIn', nextUrl));
                }
                return true;
            }

            return true;
        },
        jwt: async ({ token, user }) => {
            if (user && token.sub) {
                const exitingUser = await prisma.user.findUnique({
                    where: {
                        id: token.sub,
                    },
                });

                if (!exitingUser) return token;

                return {
                    ...token,
                    id: exitingUser.id,
                    role: exitingUser.role,
                };
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (token.sub) {
                session.user.id = token.sub;
                session.user.role = token.role;
                return session;
            }
            return session;
        },
        signIn: async ({ user, account }) => {
            if (account?.provider !== 'credentials') return true;

            if (user && user.id) {
                const exitingUser = await prisma.user.findUnique({
                    where: {
                        id: user.id,
                    },
                });

                if (!exitingUser?.emailVerified) {
                    return false;
                }
            }

            return true;
        },
        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
    },
    events: {
        linkAccount: async ({ user }) => {
            console.log(user);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date(),
                },
            });
        },
    },
} satisfies NextAuthConfig;
