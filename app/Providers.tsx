import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

import React from 'react';

const Providers = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth();

    return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default Providers;
