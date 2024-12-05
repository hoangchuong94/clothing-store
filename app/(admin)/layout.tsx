import type { Metadata } from 'next';

import { Slash } from 'lucide-react';

import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

import DashboardSidebar from '@/components/sidebar';
import LinkHierarchy from '@/components/link-hierarchy';

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
            <SidebarInset>
                <div className="flex h-14 items-center justify-between px-2">
                    <div className="flex items-center justify-center">
                        <SidebarTrigger />
                        <BreadcrumbSeparator className="list-none">
                            <Slash />
                        </BreadcrumbSeparator>
                        <LinkHierarchy />
                    </div>
                </div>

                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
