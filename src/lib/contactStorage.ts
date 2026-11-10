import { getPayload } from 'payload'
import configPromise from '@payload-config'
import fs from 'fs'
import path from 'path'

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  channel?: 'website' | 'email' | 'telegram' | 'other'
  status: 'unread' | 'read' | 'replied'
  adminNotes?: string
  replyMessage?: string
  repliedAt?: string
  createdAt: string
  updatedAt: string
}

const SEED_MESSAGES: Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@cuh.ac.in',
    subject: 'Inquiry regarding Upcoming Web Development Bootcamp',
    message: 'Hello Coding Club team, I am a 2nd year B.Tech CSE student. I would like to know if students from other departments can also join the weekend full-stack bootcamps and how the selection works.',
    channel: 'website',
    status: 'unread',
  },
  {
    name: 'Priya Sharma',
    email: 'priyasharma.mca@gmail.com',
    subject: 'Certificate verification query for Git & GitHub Masterclass',
    message: 'Hi, I completed the Git workshop last month but had an issue with the spelling in my name on the certificate. Could someone please help me get it corrected?',
    channel: 'website',
    status: 'read',
  },
  {
    name: 'Amit Kumar',
    email: 'amit.maths@cuh.ac.in',
    subject: 'Speaker / Workshop Collaboration Proposal',
    message: 'Greetings! I am writing on behalf of the Department of Mathematics. We are organizing a National Seminar on Mathematical Computing and would love to collaborate with Coding Club CUH for a hands-on Python workshop.',
    channel: 'website',
    status: 'replied',
    replyMessage: 'Dear Amit, Thank you for reaching out. We would be delighted to collaborate. Our student instructors have prepared a curriculum on NumPy & SciPy. Let us connect over a short meeting.',
    repliedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatContactDoc(doc: any): ContactMessage {
  return {
    id: String(doc.id),
    name: doc.name || '',
    email: doc.email || '',
    subject: doc.subject || '',
    message: doc.message || '',
    channel: doc.channel || 'website',
    status: doc.status || 'unread',
    adminNotes: doc.adminNotes || undefined,
    replyMessage: doc.replyMessage || undefined,
    repliedAt: doc.repliedAt || undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  }
}

let contactMigrationDone = false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureContactDataMigrated(payload: any) {
  if (contactMigrationDone) return
  contactMigrationDone = true

  try {
    const existing = await payload.find({
      collection: 'contact-messages',
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      // Check if there are legacy messages in src/data/contact-messages.json
      const legacyPath = path.join(process.cwd(), 'src', 'data', 'contact-messages.json')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let toMigrate: any[] = []

      if (fs.existsSync(legacyPath)) {
        try {
          const raw = fs.readFileSync(legacyPath, 'utf-8')
          const parsed = JSON.parse(raw || '[]')
          if (Array.isArray(parsed) && parsed.length > 0) {
            toMigrate = parsed
          }
        } catch {
          // Ignore legacy read error
        }
      }

      if (toMigrate.length === 0) {
        toMigrate = SEED_MESSAGES
      }

      for (const item of toMigrate) {
        try {
          await payload.create({
            collection: 'contact-messages',
            data: {
              name: item.name || 'Anonymous',
              email: item.email || 'student@cuh.ac.in',
              subject: item.subject || 'Inquiry',
              message: item.message || '',
              channel: item.channel || 'website',
              status: item.status || 'unread',
              adminNotes: item.adminNotes,
              replyMessage: item.replyMessage,
              repliedAt: item.repliedAt,
            },
          })
        } catch (itemErr) {
          console.warn('[CONTACT MIGRATION] Failed to migrate record:', itemErr)
        }
      }
    }
  } catch (err) {
    console.warn('[CONTACT MIGRATION] Database not ready or check skipped:', err)
  }
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    await ensureContactDataMigrated(payload)

    const result = await payload.find({
      collection: 'contact-messages',
      limit: 1000,
      sort: '-createdAt',
    })

    return (result.docs || []).map(formatContactDoc)
  } catch (err) {
    console.error('[CONTACT STORAGE ERROR] Failed to read contact messages:', err)
    return []
  }
}

export async function getContactMessageById(id: string): Promise<ContactMessage | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const numId = Number(id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let doc: any = null
    if (!isNaN(numId)) {
      doc = await payload.findByID({
        collection: 'contact-messages',
        id: numId,
      }).catch(() => null)
    }

    if (!doc) {
      const searchRes = await payload.find({
        collection: 'contact-messages',
        where: {
          id: {
            equals: id,
          },
        },
        limit: 1,
      }).catch(() => ({ docs: [] }))
      doc = searchRes.docs?.[0] || null
    }

    return doc ? formatContactDoc(doc) : null
  } catch (err) {
    console.error(`[CONTACT STORAGE ERROR] Failed to fetch message ${id}:`, err)
    return null
  }
}

export async function createContactMessage(
  data: Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<ContactMessage> {
  try {
    const payload = await getPayload({ config: configPromise })
    const doc = await payload.create({
      collection: 'contact-messages',
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        channel: data.channel || 'website',
        status: 'unread',
        adminNotes: data.adminNotes,
      },
    })

    return formatContactDoc(doc)
  } catch (err) {
    console.error('[CONTACT STORAGE ERROR] Failed to create contact message:', err)
    // Fallback object to prevent breaking callers if DB temporarily errors
    return {
      id: `err-${Date.now()}`,
      ...data,
      channel: data.channel || 'website',
      status: 'unread',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

export async function updateContactMessage(
  id: string,
  updates: Partial<ContactMessage>
): Promise<ContactMessage | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const numId = Number(id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (updates.status) updateData.status = updates.status
    if (updates.adminNotes !== undefined) updateData.adminNotes = updates.adminNotes
    if (updates.replyMessage !== undefined) updateData.replyMessage = updates.replyMessage
    if (updates.repliedAt !== undefined) updateData.repliedAt = updates.repliedAt

    let targetId: number | string = numId
    if (isNaN(numId)) {
      const existing = await getContactMessageById(id)
      if (!existing) return null
      targetId = Number(existing.id) || existing.id
    }

    const updated = await payload.update({
      collection: 'contact-messages',
      id: targetId,
      data: updateData,
    })

    return updated ? formatContactDoc(updated) : null
  } catch (err) {
    console.error(`[CONTACT STORAGE ERROR] Failed to update message ${id}:`, err)
    return null
  }
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  try {
    const payload = await getPayload({ config: configPromise })
    const numId = Number(id)

    let targetId: number | string = numId
    if (isNaN(numId)) {
      const existing = await getContactMessageById(id)
      if (!existing) return false
      targetId = Number(existing.id) || existing.id
    }

    await payload.delete({
      collection: 'contact-messages',
      id: targetId,
    })

    return true
  } catch (err) {
    console.error(`[CONTACT STORAGE ERROR] Failed to delete message ${id}:`, err)
    return false
  }
}

export async function getContactStats(): Promise<{
  total: number
  unread: number
  read: number
  replied: number
}> {
  try {
    const messages = await getAllContactMessages()
    return {
      total: messages.length,
      unread: messages.filter((m) => m.status === 'unread').length,
      read: messages.filter((m) => m.status === 'read').length,
      replied: messages.filter((m) => m.status === 'replied').length,
    }
  } catch {
    return { total: 0, unread: 0, read: 0, replied: 0 }
  }
}
