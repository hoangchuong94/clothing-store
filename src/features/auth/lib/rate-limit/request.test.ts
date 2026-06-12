import { describe, expect, it } from 'vitest';

import { extractClientIp } from './request';

describe('extractClientIp', () => {
  it('uses the first x-forwarded-for address', () => {
    expect(
      extractClientIp({
        'x-forwarded-for': '203.0.113.10, 198.51.100.1',
        'x-real-ip': '198.51.100.2',
      }),
    ).toBe('203.0.113.10');
  });

  it('falls back to x-real-ip and cf-connecting-ip', () => {
    expect(extractClientIp({ 'x-real-ip': '198.51.100.2' })).toBe('198.51.100.2');
    expect(extractClientIp({ 'cf-connecting-ip': '198.51.100.3' })).toBe('198.51.100.3');
  });

  it('supports Headers-like objects', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.11',
    });

    expect(extractClientIp(headers)).toBe('203.0.113.11');
  });

  it('returns unknown when no IP header exists', () => {
    expect(extractClientIp({})).toBe('unknown');
  });
});
