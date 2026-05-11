'use client';

import { Footer } from '@/components/footer/Footer';
import { Header } from '@/components/header/Header';
import { HeaderProvider, useHeader } from '@/components/header/HeaderContext';

function HeaderWithState() {
  const { cart, auth, logout } = useHeader();

  return <Header isLoggedIn={auth.isLoggedIn} onLogout={logout} />;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderProvider>
        <HeaderWithState />
        <main>{children}</main>
      </HeaderProvider>
      <Footer />
    </>
  );
}
