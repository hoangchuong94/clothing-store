import Header from '@/components/dashboard-header';
import SideNav from '@/components/dashboard-side-nav';
import Footer from '@/components/dashboard-footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'admin page',
    description: 'clothing store admin page',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            <Header />
            <SideNav />
            {children}
            <Footer />
        </main>
    );
}
