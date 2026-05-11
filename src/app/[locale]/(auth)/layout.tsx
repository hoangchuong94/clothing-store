import { AuthShell } from '@/features/auth/components/AuthShell';

export default async function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
