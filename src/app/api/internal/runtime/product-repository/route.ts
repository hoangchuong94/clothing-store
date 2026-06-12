import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/server/auth-config';
import { getReport } from '@/lib/server/metrics/product-repo-metrics';
import { getRepositoryHealth } from '@/features/products/server/repositories/create-product-repository';

const METRICS_API_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!role || !METRICS_API_ROLES.has(role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const report = getReport();
  if (!report.enabled) {
    return NextResponse.json({ error: 'metrics_disabled' }, { status: 403 });
  }

  const health = getRepositoryHealth();

  return NextResponse.json({
    metrics: report,
    health,
    timestamp: new Date().toISOString(),
  });
}
