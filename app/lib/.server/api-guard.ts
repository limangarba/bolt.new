import { env } from 'node:process';
import { RateLimiter, checkAccess, getClientKey, parsePositiveInt } from './security';

const DEFAULT_RATE_LIMIT = 20;
const DEFAULT_RATE_WINDOW_SECONDS = 60;

let limiter: RateLimiter | undefined;

function readEnv(cloudflareEnv: Env, name: keyof Env): string | undefined {
  // same lookup order as `getAPIKey`: process env in development, Cloudflare bindings when deployed
  return env[name] || cloudflareEnv[name];
}

/**
 * Returns an error response when the request must be rejected, `null` otherwise.
 */
export function guardApiRequest(request: Request, cloudflareEnv: Env): Response | null {
  const denied = checkAccess(request, {
    password: readEnv(cloudflareEnv, 'BOLT_ACCESS_PASSWORD'),
    username: readEnv(cloudflareEnv, 'BOLT_ACCESS_USER'),
    allowWithoutPassword: import.meta.env.DEV,
  });

  if (denied) {
    return denied;
  }

  limiter ??= new RateLimiter({
    limit: parsePositiveInt(readEnv(cloudflareEnv, 'BOLT_RATE_LIMIT'), DEFAULT_RATE_LIMIT),
    windowMs: parsePositiveInt(readEnv(cloudflareEnv, 'BOLT_RATE_WINDOW_SECONDS'), DEFAULT_RATE_WINDOW_SECONDS) * 1000,
  });

  return limiter.check(getClientKey(request));
}
