import { DEFAULT_ADMIN_SIGN_IN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from '@/routes';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import google from 'next-auth/providers/google';
import github from 'next-auth/providers/github';

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

        Credentials({
            async authorize(credentials) {
                try {
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
                } catch (error) {
                    throw error;
                }
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
                    return Response.redirect(new URL(DEFAULT_ADMIN_SIGN_IN_REDIRECT, nextUrl.origin));
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

        // redirect: async ({ url, baseUrl }) => {
        //     if (url.startsWith('/')) return `${baseUrl}${url}`;
        //     else if (new URL(url).origin === baseUrl) return url;
        //     return baseUrl;
        // },
    },
    events: {
        linkAccount: async ({ user }) => {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date(),
                },
            });
        },
    },
} satisfies NextAuthConfig;
