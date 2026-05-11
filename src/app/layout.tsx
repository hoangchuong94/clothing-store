import type { Metadata } from 'next';
import { Geist, Geist_Mono, Figtree } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

import { ThemeProvider } from '@/components/theme-provider';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cyber Brand - Premium Streetwear x Cyber Fashion | Gen Z Fashion',
  description:
    'Streetwear meets cyber. Premium fashion for Gen Z. Bold drops, limited pieces, infinite vibe. Shop exclusive collections now.',
  keywords: [
    'streetwear',
    'cyberfashion',
    'genz',
    'clothing',
    'fashion',
    'limited edition',
    'cyber',
    'techwear',
    'Gen Z',
  ],
  authors: [{ name: 'Cyber Brand' }],
  creator: 'Cyber Brand',
  openGraph: {
    title: 'Cyber Brand - Premium Streetwear x Cyber Fashion',
    description: 'Streetwear meets cyber. Bold drops, limited pieces, infinite vibe.',
    url: 'https://cyberbrand.com',
    siteName: 'Cyber Brand',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Cyber Brand - Premium Streetwear',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyber Brand - Premium Streetwear x Cyber Fashion',
    description: 'Streetwear meets cyber. Shop exclusive Gen Z fashion.',
    creator: '@cyberbrand',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        figtree.variable,
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
