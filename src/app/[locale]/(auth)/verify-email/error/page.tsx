import { VerifyEmailError } from '@/features/auth/components/verification/VerifyEmailError';

type PageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function VerifyEmailErrorPage({ searchParams }: PageProps) {
  const { reason } = await searchParams;
  return <VerifyEmailError reason={reason} />;
}
