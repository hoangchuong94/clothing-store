import { NextResponse } from 'next/server';
import { getReport } from '@/lib/server/metrics/product-repo-metrics';
import { getRepositoryHealth } from '@/features/products/server/repositories/create-product-repository';

export async function GET() {
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
