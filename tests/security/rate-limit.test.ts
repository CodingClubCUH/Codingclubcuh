import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock payload and payload-config to avoid attempting local DB connection during unit tests
const mockPayload = {
  db: {
    pool: null,
  },
}

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => mockPayload),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

import {
  getClientIp,
  checkRateLimit,
  createRateLimitResponse,
  RATE_LIMIT_CONFIGS,
} from '@/lib/rateLimit'

describe('Issue 11: Public API Rate Limiting Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Client IP Extraction & Validation', () => {
    it('prioritizes cf-connecting-ip when present and valid', () => {
      const req = new Request('http://localhost:3001/api/contact', {
        headers: {
          'cf-connecting-ip': '203.0.113.195',
          'x-forwarded-for': '198.51.100.1, 10.0.0.1',
        },
      })
      expect(getClientIp(req)).toBe('203.0.113.195')
    })

    it('prioritizes x-vercel-forwarded-for before untrusted x-forwarded-for', () => {
      const req = new Request('http://localhost:3001/api/contact', {
        headers: {
          'x-vercel-forwarded-for': '198.51.100.42',
          'x-forwarded-for': '8.8.8.8, 127.0.0.1',
        },
      })
      expect(getClientIp(req)).toBe('198.51.100.42')
    })

    it('prioritizes x-real-ip before untrusted x-forwarded-for', () => {
      const req = new Request('http://localhost:3001/api/contact', {
        headers: {
          'x-real-ip': '192.0.2.77',
          'x-forwarded-for': '10.0.0.2',
        },
      })
      expect(getClientIp(req)).toBe('192.0.2.77')
    })

    it('sanitizes and ignores invalid or spoofed non-IP characters', () => {
      const req = new Request('http://localhost:3001/api/contact', {
        headers: {
          'x-forwarded-for': 'malicious<script>alert(1)</script>, 127.0.0.1',
        },
      })
      // Falls back to safe default
      expect(getClientIp(req)).toBe('127.0.0.1')
    })
  })

  describe('Rate Limiter Behavior (Limits, 429, & Headers)', () => {
    it('allows requests below the limit and calculates remaining count correctly', async () => {
      const testIp = '192.0.2.101'
      const options = {
        keyPrefix: 'test_allow',
        limit: 3,
        windowMs: 60 * 1000,
      }

      const res1 = await checkRateLimit(testIp, options)
      expect(res1.success).toBe(true)
      expect(res1.remaining).toBe(2)

      const res2 = await checkRateLimit(testIp, options)
      expect(res2.success).toBe(true)
      expect(res2.remaining).toBe(1)

      const res3 = await checkRateLimit(testIp, options)
      expect(res3.success).toBe(true)
      expect(res3.remaining).toBe(0)
    })

    it('rejects requests exceeding the limit with success: false and valid retryAfter', async () => {
      const testIp = '192.0.2.102'
      const options = {
        keyPrefix: 'test_limit',
        limit: 2,
        windowMs: 30 * 1000,
      }

      await checkRateLimit(testIp, options) // 1st
      await checkRateLimit(testIp, options) // 2nd (limit reached)
      const res3 = await checkRateLimit(testIp, options) // 3rd (exceeded)

      expect(res3.success).toBe(false)
      expect(res3.remaining).toBe(0)
      expect(res3.retryAfter).toBeGreaterThan(0)
      expect(res3.retryAfter).toBeLessThanOrEqual(30)
    })

    it('generates standard HTTP 429 response with Retry-After and X-RateLimit headers', async () => {
      const rateLimitResult = {
        success: false,
        limit: 5,
        remaining: 0,
        resetAt: Date.now() + 25000,
        retryAfter: 25,
      }

      const res = createRateLimitResponse(rateLimitResult, {
        error: 'Too many requests. Please wait 25 seconds.',
      })

      expect(res.status).toBe(429)
      expect(res.headers.get('Retry-After')).toBe('25')
      expect(res.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(res.headers.get('X-RateLimit-Reset')).toBeDefined()

      const data = await res.json()
      expect(data.error).toContain('Too many requests')
    })

    it('ensures different client IPs have isolated independent limits', async () => {
      const ipA = '198.51.100.10'
      const ipB = '198.51.100.20'
      const options = {
        keyPrefix: 'test_isolation',
        limit: 1,
        windowMs: 60 * 1000,
      }

      // ipA uses quota
      const resA1 = await checkRateLimit(ipA, options)
      expect(resA1.success).toBe(true)

      const resA2 = await checkRateLimit(ipA, options)
      expect(resA2.success).toBe(false) // ipA is blocked

      // ipB should remain unaffected
      const resB1 = await checkRateLimit(ipB, options)
      expect(resB1.success).toBe(true)
    })
  })

  describe('Endpoint Configuration Verification', () => {
    it('defines purposeful limits for contact, auth, and chat endpoints', () => {
      expect(RATE_LIMIT_CONFIGS.contact.limit).toBe(5)
      expect(RATE_LIMIT_CONFIGS.contact.windowMs).toBe(300000) // 5 minutes

      expect(RATE_LIMIT_CONFIGS.authForgotPassword.limit).toBe(5)
      expect(RATE_LIMIT_CONFIGS.authForgotPassword.windowMs).toBe(900000) // 15 minutes

      expect(RATE_LIMIT_CONFIGS.chat.limit).toBe(30)
      expect(RATE_LIMIT_CONFIGS.chat.windowMs).toBe(60000) // 1 minute
    })
  })

  describe('PostgreSQL Shared Multi-Instance & Fail-Safe Handling', () => {
    it('executes atomic PostgreSQL upsert queries when database pool is available', async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        rows: [{ count: 2, reset_at: Date.now() + 60000 }],
      })

      const customPayload = {
        db: {
          pool: {
            query: mockQuery,
          },
        },
      }

      const res = await checkRateLimit('pg_client', {
        keyPrefix: 'test_pg',
        limit: 5,
        windowMs: 60000,
      }, customPayload)

      expect(mockQuery).toHaveBeenCalled()
      expect(res.success).toBe(true)
      expect(res.remaining).toBe(3)
    })

    it('returns 429 when PostgreSQL atomic query reports count exceeding limit', async () => {
      const mockQuery = vi.fn().mockResolvedValue({
        rows: [{ count: 6, reset_at: Date.now() + 45000 }],
      })

      const customPayload = {
        db: {
          pool: {
            query: mockQuery,
          },
        },
      }

      const res = await checkRateLimit('pg_client_exceeded', {
        keyPrefix: 'test_pg',
        limit: 5,
        windowMs: 60000,
      }, customPayload)

      expect(res.success).toBe(false)
      expect(res.remaining).toBe(0)
      expect(res.retryAfter).toBeGreaterThan(0)
    })

    it('fails safely without throwing unhandled exceptions if the database is unavailable', async () => {
      const failingPayload = {
        db: {
          pool: {
            query: vi.fn().mockRejectedValue(new Error('Postgres connection pool exhausted')),
          },
        },
      }

      // Fails safely to memory fallback
      const res = await checkRateLimit('fail_safe_ip', {
        keyPrefix: 'fail_safe',
        limit: 5,
        windowMs: 60000,
      }, failingPayload)

      expect(res).toBeDefined()
      expect(res.success).toBe(true)
      expect(res.remaining).toBe(4)
    })
  })
})
