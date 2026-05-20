/**
 * Email configuration from environment variables.
 */

function parseIntEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolEnv(...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const raw = process.env[key]?.trim().toLowerCase();
    if (raw === 'true' || raw === '1' || raw === 'yes') return true;
    if (raw === 'false' || raw === '0' || raw === 'no') return false;
  }
  return undefined;
}

const port = parseIntEnv('SMTP_PORT', 587);

/**
 * Port 465 = implicit TLS (secure: true).
 * Port 587 = STARTTLS (secure: false, requireTLS: true).
 */
function resolveSecure(smtpPort: number): boolean {
  const explicit = parseBoolEnv('SMTP_SECURE', 'SMTP_TLS');
  if (explicit !== undefined) return explicit;
  return smtpPort === 465;
}

export const emailConfig = {
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port,
  user: process.env.SMTP_USER ?? '',
  /** Gmail app passwords are often pasted with spaces — strip them */
  password: (process.env.SMTP_PASSWORD ?? '').replace(/\s/g, ''),
  from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? '',
  fromName: process.env.SMTP_FROM_NAME ?? 'Clothing Store',
  secure: resolveSecure(port),
  requireTls: port === 587,
  ignoreTls: parseBoolEnv('SMTP_IGNORE_TLS') === true,
  pool: parseBoolEnv('SMTP_POOL') === true,
  maxRetries: parseIntEnv('SMTP_MAX_RETRIES', 2),
  connectionTimeout: parseIntEnv('SMTP_TIMEOUT_MS', 15_000),
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    'http://localhost:3000',
} as const;

export function assertEmailConfig(): void {
  if (!emailConfig.user || !emailConfig.password) {
    throw new Error('SMTP_USER and SMTP_PASSWORD must be configured');
  }
}
