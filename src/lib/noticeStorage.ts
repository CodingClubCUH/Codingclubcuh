import { getPayload } from 'payload'
import configPromise from '@payload-config'
import fs from 'fs'
import path from 'path'

export interface SentNotice {
  id: string
  subject: string
  message: string
  category: string
  recipientsCount: number
  recipients: string[]
  unregisteredCount?: number
  registeredCount?: number
  ctaText?: string
  ctaUrl?: string
  sentBy?: string
  senderEmail?: string
  status: 'sent' | 'partially_sent' | 'failed' | 'simulated'
  sentAt: string
  failedCount?: number
  errors?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatNoticeDoc(doc: any): SentNotice {
  return {
    id: String(doc.id),
    subject: doc.subject || '',
    message: doc.message || '',
    category: doc.category || 'Club Announcement',
    recipientsCount: Number(doc.recipientsCount) || 0,
    recipients: Array.isArray(doc.recipients) ? doc.recipients : [],
    unregisteredCount: Number(doc.unregisteredCount) || 0,
    registeredCount: Number(doc.registeredCount) || 0,
    ctaText: doc.ctaText || undefined,
    ctaUrl: doc.ctaUrl || undefined,
    sentBy: doc.sentBy || undefined,
    senderEmail: doc.senderEmail || undefined,
    status: doc.status || 'sent',
    sentAt: doc.sentAt ? new Date(doc.sentAt).toISOString() : (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()),
    failedCount: Number(doc.failedCount) || 0,
    errors: Array.isArray(doc.errors) ? doc.errors : [],
  }
}

let noticeMigrationDone = false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureNoticesMigrated(payload: any) {
  if (noticeMigrationDone) return
  noticeMigrationDone = true

  try {
    const existing = await payload.find({
      collection: 'sent-notices',
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      const legacyPath = path.join(process.cwd(), 'src', 'data', 'sent-notices.json')
      if (fs.existsSync(legacyPath)) {
        try {
          const raw = fs.readFileSync(legacyPath, 'utf-8')
          const items = JSON.parse(raw || '[]')
          if (Array.isArray(items)) {
            for (const item of items) {
              try {
                await payload.create({
                  collection: 'sent-notices',
                  data: {
                    subject: item.subject || 'Notice',
                    message: item.message || '',
                    category: item.category || '📢 General Announcement',
                    recipientsCount: Number(item.recipientsCount) || 0,
                    recipients: Array.isArray(item.recipients) ? item.recipients : [],
                    unregisteredCount: Number(item.unregisteredCount) || 0,
                    registeredCount: Number(item.registeredCount) || 0,
                    ctaText: item.ctaText,
                    ctaUrl: item.ctaUrl,
                    sentBy: item.sentBy || 'Admin',
                    senderEmail: item.senderEmail || 'codingclub@cuh.ac.in',
                    status: item.status || 'sent',
                    failedCount: Number(item.failedCount) || 0,
                    errors: Array.isArray(item.errors) ? item.errors : [],
                    sentAt: item.sentAt ? new Date(item.sentAt).toISOString() : new Date().toISOString(),
                  },
                })
              } catch (itemErr) {
                console.warn('[NOTICE MIGRATION] Failed to migrate record:', itemErr)
              }
            }
          }
        } catch {
          // Ignore legacy read error
        }
      }
    }
  } catch (err) {
    console.warn('[NOTICE MIGRATION] Database not ready or check skipped:', err)
  }
}

export async function getAllSentNotices(): Promise<SentNotice[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    await ensureNoticesMigrated(payload)

    const result = await payload.find({
      collection: 'sent-notices',
      limit: 1000,
      sort: '-sentAt',
    })

    return (result.docs || []).map(formatNoticeDoc)
  } catch (err) {
    console.error('[NOTICE STORAGE ERROR] Failed to read sent notices:', err)
    return []
  }
}

export async function saveSentNotice(
  data: Omit<SentNotice, 'id' | 'sentAt'>
): Promise<SentNotice> {
  try {
    const payload = await getPayload({ config: configPromise })
    const doc = await payload.create({
      collection: 'sent-notices',
      data: {
        subject: data.subject,
        message: data.message,
        category: data.category,
        recipientsCount: data.recipientsCount,
        recipients: data.recipients,
        unregisteredCount: data.unregisteredCount ?? 0,
        registeredCount: data.registeredCount ?? 0,
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        sentBy: data.sentBy,
        senderEmail: data.senderEmail,
        status: data.status,
        failedCount: data.failedCount ?? 0,
        errors: data.errors || [],
        sentAt: new Date().toISOString(),
      },
    })

    return formatNoticeDoc(doc)
  } catch (err) {
    console.error('[NOTICE STORAGE ERROR] Failed to save sent notice:', err)
    // Fallback object to prevent breaking callers if DB temporarily errors
    return {
      id: `err-${Date.now()}`,
      ...data,
      sentAt: new Date().toISOString(),
    }
  }
}
