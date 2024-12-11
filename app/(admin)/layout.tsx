import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

import { auth } from '@/auth';

import DashboardSidebar from '@/components/sidebar';
import DashboardHeader from '@/components/dashboard-header';

export const metadata: Metadata = {
    title: 'admin page',
    description: 'clothing store admin page',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
    const session = await auth();
    if (!session?.user) return null;

    return (
        <SidebarProvider defaultOpen={defaultOpen || true}>
            <DashboardSidebar user={session.user} />
            <SidebarInset className="custom-scrollbar">
                <DashboardHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
