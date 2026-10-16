import { describe, expect, it } from 'vitest';
import { RateLimiter, checkAccess, getClientKey, parsePositiveInt } from './security';

function requestWith(headers: Record<string, string> = {}) {
  return new Request('https://bolt.test/api/chat', { method: 'POST', headers });
}

function basic(username: string, password: string) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  return `Basic ${btoa(String.fromCharCode(...bytes))}`;
}

describe('checkAccess', () => {
  it('fails closed when no password is configured', () => {
    const response = checkAccess(requestWith(), {});

    expect(response?.status).toBe(503);
  });

  it('allows requests without a password only when explicitly enabled', () => {
    expect(checkAccess(requestWith(), { allowWithoutPassword: true })).toBeNull();
  });

  it('asks for credentials when none are sent', () => {
    const response = checkAccess(requestWith(), { password: 'secret' });

    expect(response?.status).toBe(401);
    expect(response?.headers.get('WWW-Authenticate')).toContain('Basic');
  });

  it('rejects a wrong password', () => {
    const response = checkAccess(requestWith({ Authorization: basic('any', 'wrong') }), { password: 'secret' });

    expect(response?.status).toBe(401);
  });

  it('accepts the right password with any username when no username is configured', () => {
    expect(checkAccess(requestWith({ Authorization: basic('any', 'secret') }), { password: 'secret' })).toBeNull();
  });

  it('checks the username when one is configured', () => {
    const config = { password: 'secret', username: 'admin' };

    expect(checkAccess(requestWith({ Authorization: basic('other', 'secret') }), config)?.status).toBe(401);
    expect(checkAccess(requestWith({ Authorization: basic('admin', 'secret') }), config)).toBeNull();
  });

  it('accepts passwords containing colons and non-ASCII characters', () => {
    const password = 'mot:de:passe-é';

    expect(checkAccess(requestWith({ Authorization: basic('u', password) }), { password })).toBeNull();
  });

  it('rejects malformed authorization headers', () => {
    for (const header of ['Bearer token', 'Basic', 'Basic !!!', `Basic ${btoa('nocolon')}`]) {
      expect(checkAccess(requestWith({ Authorization: header }), { password: 'secret' })?.status).toBe(401);
    }
  });
});

describe('RateLimiter', () => {
  it('blocks requests above the limit until the window resets', () => {
    const limiter = new RateLimiter({ limit: 2, windowMs: 60_000 });

    expect(limiter.check('a', 0)).toBeNull();
    expect(limiter.check('a', 1)).toBeNull();

    const blocked = limiter.check('a', 2);

    expect(blocked?.status).toBe(429);
    expect(blocked?.headers.get('Retry-After')).toBe('60');

    expect(limiter.check('a', 60_000)).toBeNull();
  });

  it('counts each client separately', () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000 });

    expect(limiter.check('a', 0)).toBeNull();
    expect(limiter.check('b', 0)).toBeNull();
    expect(limiter.check('a', 0)?.status).toBe(429);
  });
});

describe('getClientKey', () => {
  it('prefers the Cloudflare client IP', () => {
    expect(getClientKey(requestWith({ 'CF-Connecting-IP': '1.2.3.4', 'X-Forwarded-For': '5.6.7.8' }))).toBe('1.2.3.4');
  });

  it('falls back to the first forwarded address', () => {
    expect(getClientKey(requestWith({ 'X-Forwarded-For': '5.6.7.8, 9.9.9.9' }))).toBe('5.6.7.8');
  });
});

describe('parsePositiveInt', () => {
  it('uses the fallback for missing or invalid values', () => {
    expect(parsePositiveInt(undefined, 20)).toBe(20);
    expect(parsePositiveInt('abc', 20)).toBe(20);
    expect(parsePositiveInt('0', 20)).toBe(20);
    expect(parsePositiveInt('5', 20)).toBe(5);
  });
});
