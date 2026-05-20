import { VerifyEmailPending } from '@/features/auth/components/verification/VerifyEmailPending';

type PageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  return <VerifyEmailPending email={email} />;
}
