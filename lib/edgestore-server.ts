import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler, CreateContextOptions } from '@edgestore/server/adapters/next/app';
import { initEdgeStoreClient } from '@edgestore/server/core';
import z from 'zod';
import { auth } from '@/auth';

type Context = {
    userId: string;
    userRole: 'ADMIN' | 'USER';
};

const getUser = async () => {
    const session = await auth();
    if (session?.user) {
        return session.user;
    }
    return null;
};

const createContext = async () => {
    const user = await getUser();
    return {
        userId: user?.id,
        userRole: user?.role,
    };
};

const es = initEdgeStore.context<Context>().create();

const edgeStoreRouter = es.router({
    publicImages: es
        .imageBucket({
            accept: ['image/jpeg', 'image/png'],
            maxSize: 1 * 1024 * 1024,
        })
        .input(
            z.object({
                type: z.enum(['product', 'thumbnail', 'profile']),
            }),
        )
        .path(({ input }) => [{ type: input.type }])
        .beforeUpload(({ ctx, input, fileInfo }) => {
            if (ctx.userRole === 'ADMIN') {
                return true;
            }
            return false;
        })
        .beforeDelete(({ ctx, fileInfo }) => {
            if (ctx.userRole === 'ADMIN') {
                return true;
            }
            return false;
        }),
    publicFiles: es
        .fileBucket({
            // maxSize: 1024 * 1024 * 10,
        })
        .path(({ ctx }) => [{ owner: ctx.userId }])
        .accessControl({
            OR: [
                {
                    userId: { path: 'owner' },
                },
                {
                    userRole: { eq: 'ADMIN' },
                },
            ],
        }),
});
export const handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
    createContext,
});

export type EdgeStoreRouter = typeof edgeStoreRouter;

export const backendClient = initEdgeStoreClient({
    router: edgeStoreRouter,
});
