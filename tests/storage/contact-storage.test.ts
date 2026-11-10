import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContactMessages } from '@/payload/collections/ContactMessages'

const mockPayloadInstance = {
  find: vi.fn(),
  findByID: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

vi.mock('payload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(async () => mockPayloadInstance),
  }
})

import {
  getAllContactMessages,
  getContactMessageById,
  createContactMessage,
  updateContactMessage,
  deleteContactMessage,
  getContactStats,
} from '@/lib/contactStorage'

describe('Contact Storage & Access Control', () => {
  describe('ContactMessages Collection Access Control', () => {
    it('allows anyone to create/submit a contact inquiry', () => {
      const createAccess = ContactMessages.access?.create
      expect(typeof createAccess).toBe('function')
      // @ts-expect-error test call
      expect(createAccess({ req: { user: null } })).toBe(true)
    })

    it('strictly restricts reading contact inquiries to administrators', () => {
      const readAccess = ContactMessages.access?.read
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

    it('strictly restricts updating and deleting contact inquiries to administrators', () => {
      const updateAccess = ContactMessages.access?.update
      const deleteAccess = ContactMessages.access?.delete

      // @ts-expect-error test call
      expect(updateAccess({ req: { user: null } })).toBe(false)
      // @ts-expect-error test call
      expect(updateAccess({ req: { user: { role: 'admin' } } })).toBe(true)

      // @ts-expect-error test call
      expect(deleteAccess({ req: { user: null } })).toBe(false)
      // @ts-expect-error test call
      expect(deleteAccess({ req: { user: { role: 'admin' } } })).toBe(true)
    })
  })

  describe('Contact Storage Operations via Payload', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      mockPayloadInstance.find.mockImplementation(async (opts: any) => {
        if (opts?.limit === 1) return { totalDocs: 1, docs: [] }
        return { totalDocs: 0, docs: [] }
      })
    })

    it('creates a new contact message and returns formatted data', async () => {
      mockPayloadInstance.create.mockResolvedValueOnce({
        id: 101,
        name: 'Aarav Sharma',
        email: 'aarav@cuh.ac.in',
        subject: 'Workshop query',
        message: 'When is the next React workshop?',
        channel: 'website',
        status: 'unread',
        createdAt: '2026-11-09T10:00:00.000Z',
        updatedAt: '2026-11-09T10:00:00.000Z',
      })

      const result = await createContactMessage({
        name: 'Aarav Sharma',
        email: 'aarav@cuh.ac.in',
        subject: 'Workshop query',
        message: 'When is the next React workshop?',
        channel: 'website',
      })

      expect(result.id).toBe('101')
      expect(result.name).toBe('Aarav Sharma')
      expect(result.status).toBe('unread')
      expect(mockPayloadInstance.create).toHaveBeenCalledWith({
        collection: 'contact-messages',
        data: expect.objectContaining({
          name: 'Aarav Sharma',
          email: 'aarav@cuh.ac.in',
          status: 'unread',
        }),
      })
    })

    it('reads all contact messages sorted by creation date', async () => {
      mockPayloadInstance.find.mockImplementation(async (opts: any) => {
        if (opts?.limit === 1) return { totalDocs: 2, docs: [{ id: 2 }] }
        return {
          totalDocs: 2,
          docs: [
            {
              id: 2,
              name: 'Priya',
              email: 'priya@cuh.ac.in',
              subject: 'Second msg',
              message: 'Hello',
              status: 'read',
              createdAt: '2026-11-09T11:00:00.000Z',
            },
            {
              id: 1,
              name: 'Rahul',
              email: 'rahul@cuh.ac.in',
              subject: 'First msg',
              message: 'Hi',
              status: 'unread',
              createdAt: '2026-11-09T10:00:00.000Z',
            },
          ],
        }
      })

      const messages = await getAllContactMessages()

      expect(messages.length).toBe(2)
      expect(messages[0].id).toBe('2')
      expect(messages[0].name).toBe('Priya')
      expect(messages[1].id).toBe('1')
      expect(messages[1].status).toBe('unread')
    })

    it('reads a single contact message by ID', async () => {
      mockPayloadInstance.findByID.mockResolvedValueOnce({
        id: 42,
        name: 'Vikram',
        email: 'vikram@cuh.ac.in',
        subject: 'Hackathon team',
        message: 'Looking for team members',
        status: 'unread',
      })

      const message = await getContactMessageById('42')

      expect(message).not.toBeNull()
      expect(message?.id).toBe('42')
      expect(message?.name).toBe('Vikram')
    })

    it('updates a contact message status and reply info', async () => {
      mockPayloadInstance.update.mockResolvedValueOnce({
        id: 42,
        name: 'Vikram',
        email: 'vikram@cuh.ac.in',
        subject: 'Hackathon team',
        message: 'Looking for team members',
        status: 'replied',
        replyMessage: 'We have connected you with the organizers.',
        repliedAt: '2026-11-09T12:00:00.000Z',
      })

      const updated = await updateContactMessage('42', {
        status: 'replied',
        replyMessage: 'We have connected you with the organizers.',
        repliedAt: '2026-11-09T12:00:00.000Z',
      })

      expect(updated?.status).toBe('replied')
      expect(updated?.replyMessage).toContain('connected you')
      expect(mockPayloadInstance.update).toHaveBeenCalledWith({
        collection: 'contact-messages',
        id: 42,
        data: expect.objectContaining({
          status: 'replied',
          replyMessage: 'We have connected you with the organizers.',
        }),
      })
    })

    it('deletes a contact message by ID', async () => {
      mockPayloadInstance.delete.mockResolvedValueOnce({})

      const success = await deleteContactMessage('42')

      expect(success).toBe(true)
      expect(mockPayloadInstance.delete).toHaveBeenCalledWith({
        collection: 'contact-messages',
        id: 42,
      })
    })

    it('computes accurate stats across contact inquiries', async () => {
      mockPayloadInstance.find.mockImplementation(async (opts: any) => {
        if (opts?.limit === 1) return { totalDocs: 3, docs: [] }
        return {
          totalDocs: 3,
          docs: [
            { id: 1, status: 'unread' },
            { id: 2, status: 'read' },
            { id: 3, status: 'replied' },
          ],
        }
      })

      const stats = await getContactStats()

      expect(stats.total).toBe(3)
      expect(stats.unread).toBe(1)
      expect(stats.read).toBe(1)
      expect(stats.replied).toBe(1)
    })

    it('handles database failures gracefully without unhandled crashes', async () => {
      mockPayloadInstance.find.mockRejectedValueOnce(new Error('PostgreSQL connection timeout'))

      const messages = await getAllContactMessages()
      expect(messages).toEqual([])

      mockPayloadInstance.findByID.mockRejectedValueOnce(new Error('Connection lost'))
      const message = await getContactMessageById('999')
      expect(message).toBeNull()

      mockPayloadInstance.update.mockRejectedValueOnce(new Error('Write failed'))
      const updated = await updateContactMessage('999', { status: 'read' })
      expect(updated).toBeNull()

      mockPayloadInstance.delete.mockRejectedValueOnce(new Error('Delete failed'))
      const deleted = await deleteContactMessage('999')
      expect(deleted).toBe(false)
    })
  })
})
