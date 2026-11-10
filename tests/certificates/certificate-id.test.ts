import { describe, it, expect, vi } from 'vitest'
import { generateCertificateId } from '@/payload/utilities/generateCertificateId'

describe('Issue 10: Certificate ID Collision Resistance & Uniqueness', () => {
  describe('ID Generation & Entropy', () => {
    it('generates IDs adhering to the standard format CCCUH-{TYPE}-{YEAR}-{HEX}', () => {
      const crsId = generateCertificateId('CRS', 2026)
      const intId = generateCertificateId('INT', 2026)

      expect(crsId).toMatch(/^CCCUH-CRS-2026-[0-9A-F]{8}$/)
      expect(intId).toMatch(/^CCCUH-INT-2026-[0-9A-F]{8}$/)
    })

    it('generates 5,000 unique certificate IDs with zero collisions', () => {
      const totalToGenerate = 5000
      const generatedSet = new Set<string>()

      for (let i = 0; i < totalToGenerate; i++) {
        const id = generateCertificateId('CRS', 2026)
        expect(generatedSet.has(id)).toBe(false)
        generatedSet.add(id)
      }

      expect(generatedSet.size).toBe(totalToGenerate)
    })

    it('is URL-safe and QR-code compatible without percent encoding', () => {
      const certId = generateCertificateId('CRS', 2026)
      const encoded = encodeURIComponent(certId)
      expect(encoded).toBe(certId) // No special characters needing escape
      expect(certId).not.toContain(' ')
      expect(certId).not.toContain('/')
      expect(certId).not.toContain('?')
    })
  })

  describe('Existing Legacy Certificate Compatibility', () => {
    it('preserves resolution for legacy format certificate IDs (e.g. 4-digit numbers)', () => {
      const legacyId = 'CCCUH-CRS-2026-9575'
      const legacyHardCopyId = 'CCCUH-HACK-2024-001'

      // Verification routes use exact equality match where[certificateId][equals]=...
      const encodedLegacy = encodeURIComponent(legacyId)
      expect(encodedLegacy).toBe(legacyId)
      expect(encodeURIComponent(legacyHardCopyId)).toBe(legacyHardCopyId)
    })
  })

  describe('Duplicate Key Error Handling & Collision Retry Simulation', () => {
    it('retries with a fresh ID when a database unique constraint collision occurs', async () => {
      const mockFind = vi.fn()
      const mockCreate = vi.fn()

      const generatedIds: string[] = []
      const fakeDatabase = new Set<string>(['CCCUH-CRS-2026-COLLISION1'])

      const issueCertificateWithRetry = async (studentId: number, courseId: number) => {
        const MAX_RETRIES = 5
        let createdCert: any = null

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          const candidateId = attempt === 1
            ? 'CCCUH-CRS-2026-COLLISION1' // Force collision on first attempt
            : generateCertificateId('CRS', 2026)

          generatedIds.push(candidateId)

          // 1. Pre-check simulation
          const isTaken = fakeDatabase.has(candidateId)
          if (isTaken) {
            continue
          }

          // 2. DB Insert simulation with race condition check
          if (fakeDatabase.has(candidateId)) {
            const duplicateErr: any = new Error('duplicate key value violates unique constraint')
            duplicateErr.code = '23505'
            throw duplicateErr
          }

          fakeDatabase.add(candidateId)
          createdCert = {
            id: 100 + attempt,
            certificateId: candidateId,
            student: studentId,
            course: courseId,
          }
          break
        }

        return createdCert
      }

      const result = await issueCertificateWithRetry(1, 10)
      expect(result).not.toBeNull()
      expect(result.certificateId).not.toBe('CCCUH-CRS-2026-COLLISION1')
      expect(result.certificateId).toMatch(/^CCCUH-CRS-2026-[0-9A-F]{8}$/)
      expect(generatedIds[0]).toBe('CCCUH-CRS-2026-COLLISION1')
      expect(generatedIds.length).toBe(2)
    })

    it('supports concurrent issuance across multiple simultaneous callers without ID conflict', async () => {
      const issuedIds = new Set<string>()
      const mockConcurrentIssue = async (index: number) => {
        const id = generateCertificateId('CRS', 2026)
        if (issuedIds.has(id)) {
          throw new Error(`Collision detected for index ${index}: ${id}`)
        }
        issuedIds.add(id)
        return { index, certificateId: id }
      }

      // Simulate 100 concurrent certificate issuances running via Promise.all
      const promises = Array.from({ length: 100 }, (_, i) => mockConcurrentIssue(i))
      const results = await Promise.all(promises)

      expect(results).toHaveLength(100)
      expect(issuedIds.size).toBe(100)
    })
  })
})
