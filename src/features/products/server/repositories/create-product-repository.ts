import type { ProductRepository } from './product-repository';
import { PrismaProductRepository } from './prisma-product-repository';
import { StaticProductRepository } from './static-product-repository';
import { recordSelection, recordFailure } from '@/lib/server/metrics/product-repo-metrics';

export type RepositoryMode = 'STATIC' | 'PRISMA' | 'AUTO';

const isProductionServer = typeof window === 'undefined' && process.env.NODE_ENV === 'production';

function getRepositoryMode(): RepositoryMode {
  const mode = process.env.PRODUCT_REPOSITORY_MODE?.toUpperCase() as RepositoryMode;
  if (mode === 'STATIC' || mode === 'PRISMA' || mode === 'AUTO') {
    return mode;
  }

  // Default to AUTO in production, STATIC in development
  return isProductionServer ? 'AUTO' : 'STATIC';
}

let repository: ProductRepository | undefined;
let currentMode: RepositoryMode | undefined;
let lastFallbackTime: Date | null = null;
let lastFailureTime: Date | null = null;
let fallbackCount = 0;
let failureCount = 0;

export function createProductRepository(): ProductRepository {
  if (repository) {
    return repository;
  }

  const mode = getRepositoryMode();
  currentMode = mode;

  switch (mode) {
    case 'STATIC':
      repository = new StaticProductRepository();
      try {
        recordSelection('STATIC', {
          operation: 'init',
          route: 'server',
          fallbackUsed: false,
          mode,
        });
      } catch {
        // ignore metrics recording errors
      }
      break;

    case 'PRISMA':
      try {
        repository = new PrismaProductRepository();
        try {
          recordSelection('PRISMA', {
            operation: 'init',
            route: 'server',
            fallbackUsed: false,
            mode,
          });
        } catch {
          // ignore metrics recording errors
        }
      } catch (error) {
        // In PRISMA mode, fail fast - don't fallback
        failureCount += 1;
        lastFailureTime = new Date();
        try {
          if (error instanceof Error) {
            recordFailure('PRISMA', error, {
              operation: 'init',
              route: 'server',
              fallbackUsed: false,
              mode,
            });
          }
        } catch {
          // ignore metrics recording errors
        }
        throw error;
      }
      break;

    case 'AUTO':
      try {
        repository = new PrismaProductRepository();
        try {
          recordSelection('PRISMA', {
            operation: 'init',
            route: 'server',
            fallbackUsed: false,
            mode,
          });
        } catch {
          // ignore metrics recording errors
        }
      } catch (error) {
        // In AUTO mode, fallback to static on error
        fallbackCount += 1;
        lastFallbackTime = new Date();
        repository = new StaticProductRepository();
        try {
          recordSelection('STATIC', {
            operation: 'init',
            route: 'server',
            fallbackUsed: true,
            mode,
          });
          if (error instanceof Error) {
            recordFailure('PRISMA', error, {
              operation: 'init',
              route: 'server',
              fallbackUsed: true,
              mode,
            });
          }
        } catch {
          // ignore metrics recording errors
        }
      }
      break;

    default:
      // Should never reach here due to getRepositoryMode validation
      repository = new StaticProductRepository();
      try {
        recordSelection('STATIC', {
          operation: 'init',
          route: 'server',
          fallbackUsed: false,
          mode: 'UNKNOWN',
        });
      } catch {
        // ignore metrics recording errors
      }
      break;
  }

  return repository;
}

export function getRepositoryHealth() {
  return {
    mode: currentMode || 'UNKNOWN',
    lastFallbackTime: lastFallbackTime?.toISOString() || null,
    lastFailureTime: lastFailureTime?.toISOString() || null,
    fallbackCount,
    failureCount,
    isProduction: isProductionServer,
  };
}
