import { SessionProvider } from 'next-auth/react';
import { EdgeStoreProvider } from '@/lib/edgestore';
import { auth } from '@/auth';

import React from 'react';

const Providers = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();

    return (
        <SessionProvider session={session}>
            <EdgeStoreProvider>{children}</EdgeStoreProvider>
        </SessionProvider>
    );
};

export default Providers;
