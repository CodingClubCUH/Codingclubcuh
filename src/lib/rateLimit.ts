import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export interface RateLimitOptions {
  keyPrefix: string
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number // timestamp in ms
  retryAfter: number // seconds
}

export const RATE_LIMIT_CONFIGS = {
  contact: {
    keyPrefix: 'contact',
    limit: 5,
    windowMs: 5 * 60 * 1000, // 5 requests per 5 minutes
  },
  authForgotPassword: {
    keyPrefix: 'forgot_password',
    limit: 5,
    windowMs: 15 * 60 * 1000, // 5 requests per 15 minutes
  },
  chat: {
    keyPrefix: 'chat',
    limit: 30,
    windowMs: 60 * 1000, // 30 requests per minute
  },
} as const

// In-memory fallback map for local testing, non-DB environments, or fail-safe operations
const memoryStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Extracts a verified client IP address from request headers.
 * Prioritizes trusted provider headers (Cloudflare, Vercel) and validates IP format.
 */
export function getClientIp(req: Request): string {
  // 1. Cloudflare connecting IP (trusted eyeball IP)
  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp && isValidIp(cfIp.trim())) return cfIp.trim()

  // 2. Vercel trusted proxy header
  const vercelIp = req.headers.get('x-vercel-forwarded-for')
  if (vercelIp) {
    const firstIp = vercelIp.split(',')[0].trim()
    if (isValidIp(firstIp)) return firstIp
  }

  // 3. Real IP from trusted reverse proxies
  const realIp = req.headers.get('x-real-ip')
  if (realIp && isValidIp(realIp.trim())) return realIp.trim()

  // 4. Standard X-Forwarded-For header (leftmost client IP)
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim()
    if (isValidIp(firstIp)) return firstIp
  }

  return '127.0.0.1'
}

function isValidIp(ip: string): boolean {
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Pattern = /^[a-fA-F0-9:]+$/
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip)
}

/**
 * Checks and increments rate limit for a given identifier using PostgreSQL (shared across serverless lambdas)
 * with graceful in-memory fallback.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions,
  payloadOverride?: unknown
): Promise<RateLimitResult> {
  const { keyPrefix, limit, windowMs } = options
  const key = `${keyPrefix}:${identifier}`
  const now = Date.now()
  const newResetAt = now + windowMs

  const dbUri =
    process.env.DATABASE_URI ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL

  // 1. Attempt atomic PostgreSQL check across serverless instances if configured and not offline in unit tests
  if (payloadOverride || (dbUri && process.env.NODE_ENV !== 'test')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = (payloadOverride as any) || (await getPayload({ config: configPromise }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = (payload as any)?.db

      if (db?.pool?.query) {
        const sql = `
          INSERT INTO "rate_limits" ("key", "count", "reset_at")
          VALUES ($1, 1, $2)
          ON CONFLICT ("key") DO UPDATE
          SET 
            count = CASE 
              WHEN "rate_limits"."reset_at" <= $3 THEN 1 
              ELSE "rate_limits"."count" + 1 
            END,
            reset_at = CASE 
              WHEN "rate_limits"."reset_at" <= $3 THEN $2 
              ELSE "rate_limits"."reset_at" 
            END
          RETURNING "count", "reset_at";
        `
        const res = await db.pool.query(sql, [key, newResetAt, now])
        if (res?.rows && res.rows.length > 0) {
          const count = Number(res.rows[0].count)
          const resetAt = Number(res.rows[0].reset_at)
          const remaining = Math.max(0, limit - count)
          const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000))

          // Opportunistic asynchronous cleanup of expired rate limit keys (1% chance)
          if (Math.random() < 0.01) {
            db.pool.query('DELETE FROM "rate_limits" WHERE "reset_at" < $1', [now]).catch(() => {})
          }

          return {
            success: count <= limit,
            limit,
            remaining,
            resetAt,
            retryAfter,
          }
        }
      }
    } catch {
      // Fail safely: if DB query fails or connection is absent, fall back to memory
    }
  }

  // 2. In-memory fallback (used in testing, local dev, or when database connection is unavailable)
  try {
    let entry = memoryStore.get(key)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: newResetAt }
      memoryStore.set(key, entry)
    } else {
      entry.count += 1
    }

    // Clean up memory store if it grows too large
    if (memoryStore.size > 2000) {
      for (const [k, v] of memoryStore.entries()) {
        if (v.resetAt < now) memoryStore.delete(k)
      }
    }

    const remaining = Math.max(0, limit - entry.count)
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))

    return {
      success: entry.count <= limit,
      limit,
      remaining,
      resetAt: entry.resetAt,
      retryAfter,
    }
  } catch (memErr) {
    console.error('[RATE LIMIT CRITICAL] Memory fallback failed, failing open safely:', memErr)
    // Fail safely open on catastrophic failure
    return {
      success: true,
      limit,
      remaining: 1,
      resetAt: newResetAt,
      retryAfter: 1,
    }
  }
}

/**
 * Generates an HTTP 429 response containing standard rate-limiting headers.
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  customBody?: Record<string, unknown>
): NextResponse {
  const retryAfter = result.retryAfter
  const body = customBody || {
    success: false,
    error: `Too many requests. Please try again in ${retryAfter} second${retryAfter === 1 ? '' : 's'}.`,
  }

  return NextResponse.json(body, {
    status: 429,
    headers: {
      'Retry-After': String(retryAfter),
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    },
  })
}
