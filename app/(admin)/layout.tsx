import SideNavDashboard from '@/components/side-nav';
import LinkHierarchy from '@/components/link-hierarchy';
import { Switch } from '@/components/ui/switch';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { SidebarProvider, SidebarTrigger, SidebarInset, SidebarSeparator } from '@/components/ui/sidebar';

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
            <SideNavDashboard user={session.user} />
            <SidebarInset>
                <div className="flex h-14 items-center justify-between px-2">
                    <div className="flex items-center justify-center">
                        <SidebarTrigger />
                        <LinkHierarchy />
                    </div>
                </div>
                <SidebarSeparator />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
