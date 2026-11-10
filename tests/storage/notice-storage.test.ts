import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SentNotices } from '@/payload/collections/SentNotices'
import fs from 'fs'
import path from 'path'

const mockPayloadInstance = {
  find: vi.fn(),
  create: vi.fn(),
}

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(async () => mockPayloadInstance),
  }
})

import { getAllSentNotices, saveSentNotice } from '@/lib/noticeStorage'

describe('Notice Broadcast Storage & Access Control', () => {
  describe('SentNotices Collection Access Control', () => {
    it('restricts creating broadcast notice records strictly to administrators', () => {
      const createAccess = SentNotices.access?.create
      expect(typeof createAccess).toBe('function')
      // @ts-expect-error test call
      expect(createAccess({ req: { user: null } })).toBe(false)
      // @ts-expect-error test call
      expect(createAccess({ req: { user: { role: 'student' } } })).toBe(false)
      // @ts-expect-error test call
      expect(createAccess({ req: { user: { role: 'admin' } } })).toBe(true)
    })

    it('strictly restricts reading notice broadcast history to administrators', () => {
      const readAccess = SentNotices.access?.read
      expect(typeof readAccess).toBe('function')
      // Public / Unauthenticated
      // @ts-expect-error test call
      expect(readAccess({ req: { user: null } })).toBe(false)
      // Logged-in Student
      // @ts-expect-error test call
      expect(readAccess({ req: { user: { role: 'student' } } })).toBe(false)
      // Admin
      // @ts-expect-error test call
      expect(readAccess({ req: { user: { role: 'admin' } } })).toBe(true)
    })
  })

  describe('SentNotices Storage Operations via Payload', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Default find behavior
      mockPayloadInstance.find.mockImplementation(async (opts: any) => {
        if (opts?.limit === 1) return { totalDocs: 1, docs: [{ id: 1 }] }
        return { totalDocs: 0, docs: [] }
      })
    })

    it('saves a sent notice record into the database', async () => {
      mockPayloadInstance.create.mockResolvedValueOnce({
        id: 55,
        subject: 'Workshop Reminder',
        message: 'Workshop begins tomorrow at 10 AM',
        category: '📢 General Announcement',
        recipientsCount: 25,
        recipients: ['student1@cuh.ac.in', 'student2@cuh.ac.in'],
        unregisteredCount: 5,
        registeredCount: 20,
        status: 'sent',
        sentBy: 'admin@cuh.ac.in',
        senderEmail: 'codingclub@cuh.ac.in',
        failedCount: 0,
        errors: [],
        sentAt: '2026-11-09T14:00:00.000Z',
      })

      const saved = await saveSentNotice({
        subject: 'Workshop Reminder',
        message: 'Workshop begins tomorrow at 10 AM',
        category: '📢 General Announcement',
        recipientsCount: 25,
        recipients: ['student1@cuh.ac.in', 'student2@cuh.ac.in'],
        unregisteredCount: 5,
        registeredCount: 20,
        status: 'sent',
        sentBy: 'admin@cuh.ac.in',
        senderEmail: 'codingclub@cuh.ac.in',
        failedCount: 0,
        errors: [],
      })

      expect(saved.id).toBe('55')
      expect(saved.subject).toBe('Workshop Reminder')
      expect(saved.recipientsCount).toBe(25)
      expect(mockPayloadInstance.create).toHaveBeenCalledWith({
        collection: 'sent-notices',
        data: expect.objectContaining({
          subject: 'Workshop Reminder',
          recipientsCount: 25,
          status: 'sent',
        }),
      })
    })

    it('reads all broadcast notices sorted by sentAt descending', async () => {
      mockPayloadInstance.find.mockImplementation(async (opts: any) => {
        if (opts?.limit === 1) return { totalDocs: 2, docs: [{ id: 2 }] }
        return {
          totalDocs: 2,
          docs: [
            {
              id: 2,
              subject: 'Second Notice',
              message: 'Notice 2',
              category: 'Announcement',
              recipientsCount: 10,
              recipients: [],
              status: 'sent',
              sentAt: '2026-11-09T15:00:00.000Z',
            },
            {
              id: 1,
              subject: 'First Notice',
              message: 'Notice 1',
              category: 'Announcement',
              recipientsCount: 5,
              recipients: [],
              status: 'sent',
              sentAt: '2026-11-09T10:00:00.000Z',
            },
          ],
        }
      })

      const notices = await getAllSentNotices()

      expect(notices.length).toBe(2)
      expect(notices[0].id).toBe('2')
      expect(notices[0].subject).toBe('Second Notice')
      expect(notices[1].id).toBe('1')
    })

    it('handles database errors gracefully without unhandled exceptions', async () => {
      mockPayloadInstance.find.mockRejectedValueOnce(new Error('PostgreSQL timeout'))

      const notices = await getAllSentNotices()
      expect(notices).toEqual([])

      mockPayloadInstance.create.mockRejectedValueOnce(new Error('Insert error'))
      const saved = await saveSentNotice({
        subject: 'Failing Notice',
        message: 'Content',
        category: 'Test',
        recipientsCount: 0,
        recipients: [],
        status: 'failed',
      })

      expect(saved.id).toMatch(/^err-/)
      expect(saved.subject).toBe('Failing Notice')
    })

    it('verifies that legacy JSON data exists on disk and is ready for migration', () => {
      const legacyPath = path.join(process.cwd(), 'src', 'data', 'sent-notices.json')
      expect(fs.existsSync(legacyPath)).toBe(true)

      const raw = fs.readFileSync(legacyPath, 'utf-8')
      const records = JSON.parse(raw || '[]')
      expect(Array.isArray(records)).toBe(true)
      expect(records.length).toBe(4) // 4 existing historical notices verified preserved
    })
  })
})
