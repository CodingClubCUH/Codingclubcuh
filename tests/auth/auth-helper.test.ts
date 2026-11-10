import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { User } from '@/payload-types'
import type { Payload } from 'payload'

const mockCookiesMap = new Map<string, string>()
let mockHeadersList = new Headers()

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (key: string) => {
      const value = mockCookiesMap.get(key)
      return value !== undefined ? { name: key, value } : undefined
    },
  })),
  headers: vi.fn(async () => mockHeadersList),
}))

const mockPayloadInstance = {
  auth: vi.fn(),
}

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(async () => mockPayloadInstance),
  }
})

// Import getAuthUser after mocks are configured
import { getAuthUser } from '@/payload/utilities/getAuthUser'
import { getMeUser } from '@/payload/utilities/getMeUser'

describe('Duplicate Authentication Logic Refactor (getAuthUser)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookiesMap.clear()
    mockHeadersList = new Headers()
  })

  describe('Unauthenticated Requests', () => {
    it('returns null user and isAdmin: false when no token or headers exist', async () => {
      const result = await getAuthUser()

      expect(result.user).toBeNull()
      expect(result.isAdmin).toBe(false)
      expect(result.token).toBeUndefined()
      expect(mockPayloadInstance.auth).not.toHaveBeenCalled()
    })

    it('returns null user and isAdmin: false when payload.auth returns no user', async () => {
      mockCookiesMap.set('payload-token', 'some-token')
      mockPayloadInstance.auth.mockResolvedValue({ user: null })

      const result = await getAuthUser()

      expect(result.user).toBeNull()
      expect(result.isAdmin).toBe(false)
      expect(result.token).toBe('some-token')
    })
  })

  describe('Authenticated Student Requests', () => {
    it('successfully identifies an authenticated student and sets isAdmin: false', async () => {
      mockCookiesMap.set('payload-token', 'student-jwt-token')
      const mockStudent = {
        id: 101,
        email: 'student@cuh.ac.in',
        role: 'student',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }
      mockPayloadInstance.auth.mockResolvedValue({ user: mockStudent })

      const result = await getAuthUser()

      expect(result.user).toEqual(mockStudent)
      expect(result.isAdmin).toBe(false)
      expect(result.token).toBe('student-jwt-token')
    })
  })

  describe('Authenticated Admin Requests', () => {
    it('successfully identifies an administrator and sets isAdmin: true', async () => {
      mockCookiesMap.set('payload-token', 'admin-jwt-token')
      const mockAdmin = {
        id: 1,
        email: 'admin@cuh.ac.in',
        role: 'admin',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }
      mockPayloadInstance.auth.mockResolvedValue({ user: mockAdmin })

      const result = await getAuthUser()

      expect(result.user).toEqual(mockAdmin)
      expect(result.isAdmin).toBe(true)
      expect(result.token).toBe('admin-jwt-token')
    })
  })

  describe('JWT Fallback Handling', () => {
    it('falls back to custom Authorization header if request headers initial auth returns null', async () => {
      mockCookiesMap.set('payload-token', 'fallback-jwt-token')
      const mockStudent = {
        id: 202,
        email: 'fallback@cuh.ac.in',
        role: 'student',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }

      // First call (headersList) returns null; second call (customHeaders with Authorization: JWT) returns student
      mockPayloadInstance.auth
        .mockResolvedValueOnce({ user: null })
        .mockResolvedValueOnce({ user: mockStudent })

      const result = await getAuthUser()

      expect(result.user).toEqual(mockStudent)
      expect(result.isAdmin).toBe(false)
      expect(mockPayloadInstance.auth).toHaveBeenCalledTimes(2)
    })
  })

  describe('Invalid and Expired Tokens', () => {
    it('handles expired tokens gracefully without crashing', async () => {
      mockCookiesMap.set('payload-token', 'expired-token')
      mockPayloadInstance.auth.mockRejectedValue(new Error('jwt expired'))

      const result = await getAuthUser()

      expect(result.user).toBeNull()
      expect(result.isAdmin).toBe(false)
    })

    it('handles malformed JWT tokens gracefully without crashing', async () => {
      mockCookiesMap.set('payload-token', 'malformed.token.value')
      mockPayloadInstance.auth.mockRejectedValue(new Error('invalid signature'))

      const result = await getAuthUser()

      expect(result.user).toBeNull()
      expect(result.isAdmin).toBe(false)
    })
  })

  describe('Caller Provided Payload Instance', () => {
    it('uses the provided payload instance directly without re-initialization', async () => {
      const customPayload = {
        auth: vi.fn().mockResolvedValue({
          user: { id: 77, email: 'custom@cuh.ac.in', role: 'admin' },
        }),
      } as unknown as Payload

      mockCookiesMap.set('payload-token', 'custom-token')
      const result = await getAuthUser(customPayload)

      expect(result.user?.id).toBe(77)
      expect(result.isAdmin).toBe(true)
      expect(customPayload.auth).toHaveBeenCalledTimes(1)
      expect(mockPayloadInstance.auth).not.toHaveBeenCalled()
    })
  })

  describe('Shared Utility getMeUser Integration', () => {
    it('returns the user and token via in-process auth without making network requests', async () => {
      mockCookiesMap.set('payload-token', 'me-user-token')
      const mockStudent = {
        id: 303,
        email: 'me@cuh.ac.in',
        role: 'student',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      }
      mockPayloadInstance.auth.mockResolvedValue({ user: mockStudent })

      const meUser = await getMeUser()

      expect(meUser.user).toEqual(mockStudent)
      expect(meUser.token).toBe('me-user-token')
    })
  })
})
