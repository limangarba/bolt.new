/**
 * Access control and rate limiting for the API routes.
 *
 * This module has no `~/` imports so it can also be used by the Cloudflare Pages
 * function in `functions/[[path]].ts`.
 */

export interface AccessConfig {
  /** Password required through HTTP Basic auth. Access is denied when missing, unless `allowWithoutPassword`. */
  password?: string;

  /** Optional username. When unset, any username is accepted. */
  username?: string;

  /** Only meant for local development (`remix vite:dev`). */
  allowWithoutPassword?: boolean;
}

const REALM = 'Bolt';

export function checkAccess(request: Request, config: AccessConfig): Response | null {
  const { password, username, allowWithoutPassword } = config;

  if (!password) {
    if (allowWithoutPassword) {
      return null;
    }

    return new Response('Access control is not configured: set BOLT_ACCESS_PASSWORD.', { status: 503 });
  }

  const credentials = parseBasicAuth(request.headers.get('Authorization'));

  const authorized =
    credentials !== null &&
    timingSafeEqual(credentials.password, password) &&
    (username === undefined || username === '' || timingSafeEqual(credentials.username, username));

  if (authorized) {
    return null;
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  });
}

function parseBasicAuth(header: string | null): { username: string; password: string } | null {
  if (!header) {
    return null;
  }

  const [scheme, encoded] = header.split(' ');

  if (scheme?.toLowerCase() !== 'basic' || !encoded) {
    return null;
  }

  let decoded: string;

  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)));
  } catch {
    return null;
  }

  const separator = decoded.indexOf(':');

  if (separator === -1) {
    return null;
  }

  return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);

  // compare over the longest length so the duration does not reveal where the inputs differ
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;

  for (let i = 0; i < length; i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }

  return diff === 0;
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

/**
 * Fixed-window, in-memory rate limiter keyed by client IP.
 *
 * On Cloudflare the counters live in a single isolate, so this is a best-effort guard
 * against abuse; pair it with a Cloudflare WAF rate limiting rule for strict limits.
 */
export class RateLimiter {
  #hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly _config: RateLimitConfig) {}

  check(key: string, now = Date.now()): Response | null {
    this.#prune(now);

    const entry = this.#hits.get(key);

    if (!entry || entry.resetAt <= now) {
      this.#hits.set(key, { count: 1, resetAt: now + this._config.windowMs });
      return null;
    }

    if (entry.count < this._config.limit) {
      entry.count++;
      return null;
    }

    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

    return new Response('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    });
  }

  #prune(now: number) {
    // keep memory bounded when many distinct clients hit the isolate
    if (this.#hits.size < 1000) {
      return;
    }

    for (const [key, entry] of this.#hits) {
      if (entry.resetAt <= now) {
        this.#hits.delete(key);
      }
    }
  }
}

export function getClientKey(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
