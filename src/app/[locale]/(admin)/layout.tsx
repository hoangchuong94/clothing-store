import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { auth } from '@/features/auth/server/auth-config';
import { APP_ROUTES } from '@/features/auth/config/app-routes';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id) {
    redirect({
      href: APP_ROUTES.AUTH.SIGN_IN,
      locale,
    });
  }

  if (!role || !ADMIN_ROLES.has(role)) {
    redirect({
      href: APP_ROUTES.AUTH.FORBIDDEN,
      locale,
    });
  }

  return <>{children}</>;
}
