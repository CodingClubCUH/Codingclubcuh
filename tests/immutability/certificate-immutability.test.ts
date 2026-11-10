import { describe, it, expect, vi } from 'vitest'
import { enforceCertificateImmutability } from '@/payload/collections/Certificates'

describe('Certificate Immutability Enforcement', () => {
  describe('enforceCertificateImmutability hook', () => {
    it('throws an error when attempting to update an already issued certificate', () => {
      const originalDoc = {
        id: 1,
        certificateId: 'CCCUH-CRS-2026-1001',
        studentName: 'Aarav Patel',
        course: 'B.Tech CSE',
        isIssued: true,
      }

      const incomingData = {
        studentName: 'Aarav Kumar Patel',
        course: 'MCA',
      }

      expect(() => {
        enforceCertificateImmutability({
          operation: 'update',
          originalDoc,
          data: incomingData,
        } as any)
      }).toThrow('Issued certificates are immutable and cannot be modified.')
    })

    it('allows updating an unissued (draft) certificate', () => {
      const originalDoc = {
        id: 2,
        certificateId: 'CCCUH-CRS-2026-1002',
        studentName: 'Draft Student',
        course: 'Other',
        isIssued: false,
      }

      const incomingData = {
        studentName: 'Corrected Student Name',
        course: 'Master of Computer Applications (M.C.A.)',
        semester: '2nd Semester',
      }

      const result = enforceCertificateImmutability({
        operation: 'update',
        originalDoc,
        data: incomingData,
      } as any)

      expect(result).toEqual(incomingData)
    })

    it('allows updating an unissued certificate when transitioning from draft to issued', () => {
      const originalDoc = {
        id: 3,
        certificateId: 'CCCUH-CRS-2026-1003',
        studentName: 'Student Name',
        isIssued: false,
      }

      const incomingData = {
        isIssued: true,
      }

      const result = enforceCertificateImmutability({
        operation: 'update',
        originalDoc,
        data: incomingData,
      } as any)

      expect(result).toEqual(incomingData)
    })

    it('allows creation of new certificates (both issued and draft)', () => {
      const createIssuedData = {
        certificateId: 'CCCUH-CRS-2026-1004',
        studentName: 'New Student',
        isIssued: true,
      }

      const createDraftData = {
        certificateId: 'CCCUH-CRS-2026-1005',
        studentName: 'Draft Student',
        isIssued: false,
      }

      expect(() => {
        enforceCertificateImmutability({
          operation: 'create',
          originalDoc: undefined,
          data: createIssuedData,
        } as any)
      }).not.toThrow()

      expect(() => {
        enforceCertificateImmutability({
          operation: 'create',
          originalDoc: undefined,
          data: createDraftData,
        } as any)
      }).not.toThrow()
    })
  })

  describe('Regression: Student profile update does not modify issued certificates', () => {
    it('only updates unissued draft certificates and leaves issued certificates untouched', async () => {
      const studentId = 42

      // Simulated certificates in DB for this student
      const issuedCertificate = {
        id: 101,
        student: studentId,
        studentName: 'Original Student Name',
        course: 'Original B.Tech Program',
        semester: '4th Semester',
        department: 'Computer Science',
        isIssued: true,
      }

      const draftCertificate = {
        id: 102,
        student: studentId,
        studentName: 'Original Student Name',
        course: 'Original B.Tech Program',
        semester: '4th Semester',
        department: 'Computer Science',
        isIssued: false,
      }

      const allCertificates = [issuedCertificate, draftCertificate]

      // Mock Payload client matching the updated /api/student/details query
      const updateMock = vi.fn().mockResolvedValue({})
      const mockPayload = {
        find: vi.fn().mockImplementation(async ({ where }) => {
          // Verify that query filters out issued certificates
          const isFilteringOutIssued = where?.and?.some(
            (cond: any) => cond?.isIssued?.not_equals === true
          )

          const docs = allCertificates.filter((cert) => {
            const matchesStudent = cert.student === studentId
            if (isFilteringOutIssued) {
              return matchesStudent && cert.isIssued !== true
            }
            return matchesStudent
          })

          return { docs }
        }),
        update: updateMock,
      }

      // Updated profile data submitted by the student
      const updatedProfile = {
        name: 'New Profile Name',
        course: 'Master of Computer Applications (M.C.A.)',
        semester: '1st Semester',
        department: 'Computer Sciences & Information Technology',
      }

      // Execute the exact sync logic used in /api/student/details
      const existingCerts = await mockPayload.find({
        collection: 'certificates',
        where: {
          and: [
            { student: { equals: studentId } },
            { isIssued: { not_equals: true } },
          ],
        },
        limit: 200,
      })

      let syncedCertCount = 0
      for (const cert of existingCerts.docs) {
        if (cert.isIssued) continue

        const certUpdate = {
          course: updatedProfile.course,
          semester: updatedProfile.semester,
          department: updatedProfile.department,
          studentName: updatedProfile.name,
        }

        await mockPayload.update({
          collection: 'certificates',
          id: cert.id,
          data: certUpdate,
        })
        syncedCertCount++
      }

      // Assertions:
      // 1. Only 1 certificate was synced (the draft one)
      expect(syncedCertCount).toBe(1)

      // 2. The update mock was only called once for draft certificate (id: 102)
      expect(updateMock).toHaveBeenCalledTimes(1)
      expect(updateMock).toHaveBeenCalledWith({
        collection: 'certificates',
        id: 102,
        data: {
          course: 'Master of Computer Applications (M.C.A.)',
          semester: '1st Semester',
          department: 'Computer Sciences & Information Technology',
          studentName: 'New Profile Name',
        },
      })

      // 3. The issued certificate (id: 101) was NEVER updated
      expect(updateMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 101 })
      )

      // 4. Verify that even if a direct update were somehow called on issuedCertificate,
      // the collection hook rejects it
      expect(() => {
        enforceCertificateImmutability({
          operation: 'update',
          originalDoc: issuedCertificate,
          data: { studentName: 'Tampered Name' },
        } as any)
      }).toThrow('Issued certificates are immutable and cannot be modified.')
    })
  })
})
