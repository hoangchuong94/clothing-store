import { normalizeRateLimitIp } from './keys';

export type HeadersLike =
  | Pick<Headers, 'get'>
  | Record<string, string | string[] | undefined | null>;

const IP_HEADER_PRIORITY = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'] as const;

function getHeaderValue(headers: HeadersLike, name: string): string | undefined {
  const getter = (headers as Pick<Headers, 'get'>).get;
  if (typeof getter === 'function') {
    return getter.call(headers, name) ?? undefined;
  }

  const record = headers as Record<string, string | string[] | undefined | null>;
  const value = record[name] ?? record[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value ?? undefined;
}

function firstForwardedIp(value: string): string {
  return value.split(',')[0]?.trim() ?? '';
}

export function extractClientIp(headers: HeadersLike): string {
  for (const header of IP_HEADER_PRIORITY) {
    const value = getHeaderValue(headers, header);
    if (!value) {
      continue;
    }

    const ip = header === 'x-forwarded-for' ? firstForwardedIp(value) : value.trim();
    if (ip) {
      return normalizeRateLimitIp(ip);
    }
  }

  return normalizeRateLimitIp(undefined);
}
