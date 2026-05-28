const ENABLED =
  process.env.REPO_METRICS_ENABLED === 'true' || process.env.NODE_ENV !== 'production';

type RepoName = 'STATIC' | 'PRISMA' | 'UNKNOWN';

interface Report {
  enabled: boolean;
  totals: {
    selections: number;
    prisma_reads: number;
    static_reads: number;
    fallback_reads: number;
    failures: number;
  };
  byRepo: Record<RepoName, { reads: number; failures: number; selections: number }>;
  lastErrors: Array<{
    timestamp: string;
    repository: RepoName;
    route?: string;
    operation?: string;
    message: string;
  }>;
}

const MAX_ERRORS = 50;

const state: Report = {
  enabled: ENABLED,
  totals: {
    selections: 0,
    prisma_reads: 0,
    static_reads: 0,
    fallback_reads: 0,
    failures: 0,
  },
  byRepo: {
    STATIC: { reads: 0, failures: 0, selections: 0 },
    PRISMA: { reads: 0, failures: 0, selections: 0 },
    UNKNOWN: { reads: 0, failures: 0, selections: 0 },
  },
  lastErrors: [],
};

function isEnabled() {
  return state.enabled;
}

function now() {
  return new Date().toISOString();
}

export function recordSelection(
  repo: RepoName,
  opts?: { route?: string; operation?: string; fallbackUsed?: boolean; mode?: string },
) {
  if (!isEnabled()) return;
  state.totals.selections += 1;
  state.byRepo[repo].selections += 1;
  if (opts?.fallbackUsed) {
    state.totals.fallback_reads += 1;
  }
  // structured log
  const log = {
    timestamp: now(),
    repository: repo,
    route: opts?.route ?? 'unknown',
    operation: opts?.operation ?? 'init',
    duration_ms: opts?.operation === 'init' ? 0 : undefined,
    success: true,
    fallback_used: !!opts?.fallbackUsed,
    mode: opts?.mode ?? 'UNKNOWN',
  } as Record<string, unknown>;
  try {
    console.log(JSON.stringify({ product_repo_event: log }));
  } catch {
    // ignore logging errors
  }
}

export function recordRead(repo: RepoName, opts?: { route?: string; operation?: string }) {
  if (!isEnabled()) return;
  state.byRepo[repo].reads += 1;
  if (repo === 'PRISMA') state.totals.prisma_reads += 1;
  if (repo === 'STATIC') state.totals.static_reads += 1;
  // log
  const log = {
    timestamp: now(),
    repository: repo,
    route: opts?.route ?? 'unknown',
    operation: opts?.operation ?? 'list',
    duration_ms: undefined,
    success: true,
    fallback_used: false,
  } as Record<string, unknown>;
  try {
    console.log(JSON.stringify({ product_repo_event: log }));
  } catch {
    // ignore logging errors
  }
}

export function recordFailure(
  repo: RepoName,
  err: Error,
  opts?: { route?: string; operation?: string; fallbackUsed?: boolean; mode?: string },
) {
  if (!isEnabled()) return;
  state.totals.failures += 1;
  state.byRepo[repo].failures += 1;
  const entry = {
    timestamp: now(),
    repository: repo,
    route: opts?.route,
    operation: opts?.operation,
    message: err.message,
  };
  state.lastErrors.unshift(entry);
  if (state.lastErrors.length > MAX_ERRORS) state.lastErrors.pop();
  const log = {
    timestamp: now(),
    repository: repo,
    route: opts?.route ?? 'unknown',
    operation: opts?.operation ?? 'unknown',
    duration_ms: undefined,
    success: false,
    fallback_used: !!opts?.fallbackUsed,
    mode: opts?.mode ?? 'UNKNOWN',
    error: err.message,
  } as Record<string, unknown>;
  try {
    console.error(JSON.stringify({ product_repo_event: log }));
  } catch {
    // ignore logging errors
  }
}

export function getReport() {
  return {
    enabled: state.enabled,
    totals: state.totals,
    byRepo: state.byRepo,
    lastErrors: state.lastErrors.slice(0, 20),
  } as Report;
}
