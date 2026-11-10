import { describe, it, expect } from 'vitest'
import {
  canReadCertificates,
  canReadCertificateStudent,
} from '@/payload/access/canReadCertificates'
import type { User } from '@/payload-types'
import type { PayloadRequest } from 'payload'

function createMockReq(user: Partial<User> | null = null): PayloadRequest {
  return {
    user: user as User | null,
  } as unknown as PayloadRequest
}

describe('Certificates Collection Access Control', () => {
  describe('canReadCertificates (Collection-level read)', () => {
    it('allows administrators full access to all certificates including drafts', async () => {
      const adminReq = createMockReq({ id: 1, role: 'admin', email: 'admin@cuh.ac.in' })
      const result = await canReadCertificates({ req: adminReq })

      expect(result).toBe(true)
    })

    it('restricts unauthenticated public visitors to issued certificates only', async () => {
      const publicReq = createMockReq(null)
      const result = await canReadCertificates({ req: publicReq })

      expect(result).toEqual({
        isIssued: {
          equals: true,
        },
      })
    })

    it('restricts non-admin students to issued certificates only (preventing access to draft certificates)', async () => {
      const studentReq = createMockReq({ id: 42, role: 'student', email: 'student@cuh.ac.in' })
      const result = await canReadCertificates({ req: studentReq })

      expect(result).toEqual({
        isIssued: {
          equals: true,
        },
      })
    })

    it('prevents unauthenticated callers from reading draft certificates', async () => {
      const publicReq = createMockReq(null)
      const accessConstraint = await canReadCertificates({ req: publicReq })

      // When accessConstraint is an object, it dictates the database WHERE clause
      expect(accessConstraint).not.toBe(true)
      expect(typeof accessConstraint).toBe('object')
      expect((accessConstraint as { isIssued: { equals: boolean } }).isIssued.equals).toBe(true)
    })
  })

  describe('canReadCertificateStudent (Field-level student relationship access)', () => {
    it('allows administrators to read the linked student user account', () => {
      const adminReq = createMockReq({ id: 1, role: 'admin' })
      const doc = { id: 10, student: 100, isIssued: true }

      const result = canReadCertificateStudent({
        req: adminReq,
        doc,
      } as any)

      expect(result).toBe(true)
    })

    it('allows the certificate owner (student) to read their own linked user relationship', () => {
      const ownerReq = createMockReq({ id: 100, role: 'student' })
      const doc = { id: 10, student: 100, isIssued: true }

      const result = canReadCertificateStudent({
        req: ownerReq,
        doc,
      } as any)

      expect(result).toBe(true)
    })

    it('allows the certificate owner to read their relationship when student is populated as an object', () => {
      const ownerReq = createMockReq({ id: 100, role: 'student' })
      const doc = {
        id: 10,
        student: { id: 100, email: 'student@cuh.ac.in' },
        isIssued: true,
      }

      const result = canReadCertificateStudent({
        req: ownerReq,
        doc,
      } as any)

      expect(result).toBe(true)
    })

    it('prevents third-party students from reading another student user account linkage', () => {
      const otherStudentReq = createMockReq({ id: 999, role: 'student' })
      const doc = { id: 10, student: 100, isIssued: true }

      const result = canReadCertificateStudent({
        req: otherStudentReq,
        doc,
      } as any)

      expect(result).toBe(false)
    })

    it('prevents unauthenticated public verifiers from reading the student user account linkage', () => {
      const publicReq = createMockReq(null)
      const doc = { id: 10, student: 100, isIssued: true }

      const result = canReadCertificateStudent({
        req: publicReq,
        doc,
      } as any)

      expect(result).toBe(false)
    })

    it('safely handles documents without a student relationship', () => {
      const studentReq = createMockReq({ id: 100, role: 'student' })
      const doc = { id: 10, isIssued: true }

      const result = canReadCertificateStudent({
        req: studentReq,
        doc,
      } as any)

      expect(result).toBe(false)
    })
  })
})
